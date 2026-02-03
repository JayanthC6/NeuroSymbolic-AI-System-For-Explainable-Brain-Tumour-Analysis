"""
Handles all API routes for /patients and /studies.
Updated with DICOM (.dcm) Support, Mask Editing, and Treatment Plan Saving.
"""

from fastapi import (
    APIRouter, Depends, HTTPException, status, 
    Form, File, UploadFile
)
from typing import List
import os
import aiofiles
from bson import ObjectId
from pathlib import Path
import tensorflow as tf
import cv2
import numpy as np
import pydicom
from PIL import Image
import io
from .database import db, Patient, Study, PatientDetailsResponse
from .auth import get_current_user
from .app_simple.ai_pipeline_simple import run_simple_analysis, extract_facts_from_mask

BASE_DIR = Path(__file__).resolve().parent
CLASSIFICATION_MODEL_PATH = BASE_DIR / "models" / "model.h5"
SEGMENTATION_MODEL_PATH = BASE_DIR / "models" / "segmentation_model.h5"
UPLOADS_DIR = BASE_DIR / "uploads"

router = APIRouter(
    tags=["Patients & Studies"],
    dependencies=[Depends(get_current_user)] 
)

os.makedirs(UPLOADS_DIR, exist_ok=True)

def dice_loss(y_true, y_pred, smooth=1e-6):
    y_true_f = tf.keras.layers.Flatten()(y_true)
    y_pred_f = tf.keras.layers.Flatten()(y_pred)
    inter = tf.reduce_sum(y_true_f * y_pred_f)
    return 1.0 - ((2.0 * inter + smooth) / (tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) + smooth))

CUSTOM_OBJECTS = {"dice_loss": dice_loss}

def process_dicom(file_bytes):
    """Reads DICOM bytes, extracts metadata, converts image to PNG bytes."""
    try:
        dicom_data = pydicom.dcmread(io.BytesIO(file_bytes))
        
        metadata = {
            "patient_name": str(dicom_data.get("PatientName", "Unknown")),
            "patient_id": str(dicom_data.get("PatientID", "Unknown")),
            "modality": str(dicom_data.get("Modality", "MR")),
            "study_date": str(dicom_data.get("StudyDate", "Unknown"))
        }

        if not hasattr(dicom_data, "pixel_array"):
            raise ValueError("DICOM file has no pixel data.")

        pixel_array = dicom_data.pixel_array.astype(float)
        
        scaled_image = (np.maximum(pixel_array, 0) / pixel_array.max()) * 255.0
        scaled_image = np.uint8(scaled_image)

        image = Image.fromarray(scaled_image)
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        return img_byte_arr.getvalue(), metadata

    except Exception as e:
        print(f"DICOM processing error: {e}")
        return None, None

@router.post("/patients", response_model=Patient, status_code=status.HTTP_201_CREATED)
async def create_patient(patient: Patient):
    existing_patient = await db.patients.find_one({"patient_id": patient.patient_id})
    if existing_patient:
        raise HTTPException(status_code=400, detail="Patient ID already exists")
    patient_dict = patient.model_dump(by_alias=True, exclude={"id"})
    result = await db.patients.insert_one(patient_dict)
    created_patient = await db.patients.find_one({"_id": result.inserted_id})
    return Patient(**created_patient)

@router.get("/patients", response_model=List[Patient])
async def get_all_patients():
    patients_cursor = db.patients.find()
    patients = [Patient(**p) async for p in patients_cursor]
    return patients

@router.get("/patients/{patient_id}", response_model=PatientDetailsResponse)
async def get_patient_details(patient_id: str):
    patient_data = await db.patients.find_one({"patient_id": patient_id})
    if patient_data is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    studies_cursor = db.studies.find({"patient_id": patient_id}).sort("study_date", -1)
    patient = Patient(**patient_data)
    studies = [Study(**s) async for s in studies_cursor]
    return {"patient": patient, "studies": studies}

@router.delete("/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(patient_id: str):
    """
    Deletes a patient and all their associated studies.
    """
    patient = await db.patients.find_one({"patient_id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    await db.studies.delete_many({"patient_id": patient_id})
    result = await db.patients.delete_one({"patient_id": patient_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete patient")
    
    return

@router.post("/studies/upload", summary="Upload and analyze MRI (Supports PNG/JPG/DCM)")
async def upload_and_analyze(
    patient_id: str = Form(...),
    file: UploadFile = File(...),
    idh_status: str = Form("Unknown"),
    mgmt_status: str = Form("Unknown")
):
    print("Loading AI models...")
    try:
        clf_model = tf.keras.models.load_model(CLASSIFICATION_MODEL_PATH)
        seg_model = tf.keras.models.load_model(SEGMENTATION_MODEL_PATH, custom_objects=CUSTOM_OBJECTS)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model loading failed: {e}")

    filename = file.filename
    file_bytes = await file.read()
    dicom_meta = None
    
    if filename.lower().endswith(".dcm"):
        png_bytes, metadata = process_dicom(file_bytes)
        if png_bytes is None: raise HTTPException(400, "Invalid DICOM")
        file_bytes = png_bytes
        filename = filename.replace(".dcm", ".png")
        dicom_meta = metadata
    
    base_filename, _ = os.path.splitext(filename)
    unique_filename = f"{base_filename}_{ObjectId()}.png"
    original_image_path = UPLOADS_DIR / unique_filename 

    try:
        async with aiofiles.open(original_image_path, 'wb') as out_file:
            await out_file.write(file_bytes)
    except Exception as e:
        raise HTTPException(500, f"Failed to save file: {e}")

    try:
        analysis_results = await run_simple_analysis(
            image_path=str(original_image_path),
            original_filename=unique_filename,
            clf_model=clf_model,
            seg_model=seg_model
        )
    except Exception as e:
        if os.path.exists(original_image_path): os.remove(original_image_path)
        raise HTTPException(500, f"AI Analysis failed: {e}")

    from .app_simple.reasoner_simple import simple_reasoner
    
    genetic_data = {"idh_status": idh_status, "mgmt_status": mgmt_status}
    full_explanation = simple_reasoner.generate_explanation(analysis_results["ai_facts"], genetic_data)
    treatment_plan = simple_reasoner.generate_treatment_plan(analysis_results["ai_facts"], genetic_data)
    doctor_notes = ""
    if dicom_meta:
        doctor_notes = f"[DICOM DATA] Scanner: {dicom_meta['modality']} | Date: {dicom_meta['study_date']}"
    if idh_status != "Unknown" or mgmt_status != "Unknown":
        doctor_notes += f" | Genetics: IDH-{idh_status}, MGMT-{mgmt_status}"

    study_doc = Study(
        patient_id=patient_id,
        mri_image_path=f"/uploads/{unique_filename}",
        seg_mask_path=analysis_results["image_paths"]["seg_mask"],
        grad_cam_path=analysis_results["image_paths"]["grad_cam"],
        ai_facts=analysis_results["ai_facts"],
        final_explanation=full_explanation,  
        doctor_notes=doctor_notes,
        treatment=treatment_plan
    )

    await db.studies.insert_one(study_doc.model_dump(by_alias=True, exclude={"id"}))
    
    return {
        "image_paths": study_doc.mri_image_path,
        "prediction": analysis_results["prediction"],
        "explanation": full_explanation
    }

@router.post("/studies/{study_id}/update-mask")
async def update_study_mask(study_id: str, file: UploadFile = File(...)):
    try:
        obj_id = ObjectId(study_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    study = await db.studies.find_one({"_id": obj_id})
    if not study: raise HTTPException(404, "Study not found")

    db_path = study["seg_mask_path"]
    filename = os.path.basename(db_path)
    save_path = UPLOADS_DIR / "xai_outputs" / filename
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    cv2.imwrite(str(save_path), img)

    new_facts = extract_facts_from_mask(img)
    updated_facts = study["ai_facts"]
    updated_facts.update(new_facts)

    await db.studies.update_one({"_id": obj_id}, {"$set": {"ai_facts": updated_facts}})
    return {"message": "Mask updated", "new_facts": updated_facts}