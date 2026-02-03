import os
import random
import shutil
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from . import ai_models 
from .app_simple.ai_pipeline_simple import run_simple_analysis

router = APIRouter()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "MRI Images", "Testing") 
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.get("/quiz/next-case")
async def get_next_quiz_case():
    """
    Generates a random case from the 8k dataset.
    """
    print(f"🔍 DEBUG: Looking for dataset in: {DATASET_DIR}")

    if not os.path.exists(DATASET_DIR):
        raise HTTPException(500, f"Dataset folder missing: {DATASET_DIR}")
    ai_models.load_models()
    
    if ai_models.classification_model is None:
        raise HTTPException(500, "AI Models not loaded.")
    available_classes = [
        d for d in os.listdir(DATASET_DIR) 
        if os.path.isdir(os.path.join(DATASET_DIR, d)) 
        and not d.lower().startswith("no") 
    ]

    if not available_classes:
        raise HTTPException(500, f"No class folders found in {DATASET_DIR}")
    selected_class = random.choice(available_classes)
    class_path = os.path.join(DATASET_DIR, selected_class)
    images = [f for f in os.listdir(class_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not images:
        raise HTTPException(500, f"No images in {selected_class}")
    
    random_image_name = random.choice(images)
    original_full_path = os.path.join(class_path, random_image_name)
    new_filename = f"quiz_{random.randint(1000,9999)}_{random_image_name}"
    destination_path = os.path.join(UPLOADS_DIR, new_filename)
    shutil.copy(original_full_path, destination_path)

    try:
        analysis_result = await run_simple_analysis(
            image_path=destination_path,
            original_filename=new_filename,
            clf_model=ai_models.classification_model,
            seg_model=ai_models.segmentation_model
        )
    except Exception as e:
        print(f"🔥 PIPELINE ERROR: {e}")
        raise HTTPException(500, f"AI Analysis failed: {str(e)}")

    return {
        "id": random.randint(100, 999),
        "type": selected_class.capitalize(),
        "ai_prediction": analysis_result["prediction"]["predicted_class"],
        "confidence": analysis_result["prediction"]["confidence"],
        "explanation": analysis_result["explanation"],
        "imageUri": f"/uploads/{new_filename}",
        "gradCamUri": analysis_result["image_paths"]["grad_cam"],
        "maskUri": analysis_result["image_paths"]["seg_mask"]
    }

@router.post("/quiz/score")
async def score_drawing(
    mask_url: str = Form(...), 
    drawing: UploadFile = File(...)
):
    """
    Compares Student Drawing vs AI Mask using IoU (Intersection over Union).
    """
    try:
        filename = os.path.basename(mask_url)
        ai_mask_path = os.path.join(UPLOADS_DIR, "xai_outputs", filename)
        
        if not os.path.exists(ai_mask_path):
            ai_mask_path = os.path.join(UPLOADS_DIR, filename)
            
        if not os.path.exists(ai_mask_path):
            print(f"❌ Mask not found at: {ai_mask_path}")
            raise HTTPException(404, "Original AI mask not found for scoring")

        ai_mask = cv2.imread(ai_mask_path, cv2.IMREAD_GRAYSCALE)
        
        content = await drawing.read()
        nparr = np.frombuffer(content, np.uint8)
        student_mask = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

        if ai_mask is None:
            raise HTTPException(500, "Failed to read AI mask image")
        if student_mask is None:
            raise HTTPException(500, "Failed to read student drawing")

        if student_mask.shape != ai_mask.shape:
            student_mask = cv2.resize(student_mask, (ai_mask.shape[1], ai_mask.shape[0]))

        _, ai_bin = cv2.threshold(ai_mask, 10, 1, cv2.THRESH_BINARY)
        _, stu_bin = cv2.threshold(student_mask, 10, 1, cv2.THRESH_BINARY)

        intersection = np.logical_and(ai_bin, stu_bin)
        union = np.logical_or(ai_bin, stu_bin)
        
        intersection_area = np.sum(intersection)
        union_area = np.sum(union)
        
        iou_score = 0.0
        if union_area > 0:
            iou_score = intersection_area / union_area
        
        accuracy = round(iou_score * 100, 1)
        
        if accuracy > 60:
            feedback = "Excellent! Your diagnosis aligns closely with the AI."
        elif accuracy > 30:
            feedback = "Good effort. You found the general area, but check the boundaries."
        elif accuracy > 5:
             feedback = "You found the lesion, but the coverage is partial."
        else:
            feedback = "Missed the location. Compare with the AI result."

        return {
            "iou": iou_score,
            "accuracy": accuracy,
            "feedback": feedback
        }

    except Exception as e:
        print(f"Scoring Error: {e}")
        raise HTTPException(500, f"Scoring failed: {str(e)}")