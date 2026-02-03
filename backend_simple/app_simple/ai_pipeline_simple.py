import tensorflow as tf
import numpy as np
import cv2
import os
from typing import Dict, Any
from .reasoner_simple import simple_reasoner
from .xai_simple import generate_grad_cam, save_grad_cam_overlay, save_segmentation_overlay

print("AI pipeline module imported. Models will be provided at runtime by the caller.")

IMAGE_SIZE_CLASSIFY = (128, 128)  
IMAGE_SIZE_SEGMENT = (256, 256)   
CLASSES = ["glioma", "meningioma", "notumor", "pituitary"]
LAST_CONV_LAYER_NAME = "block5_conv3"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
XAI_OUTPUT_DIR = os.path.join(UPLOADS_DIR, "xai_outputs")

os.makedirs(XAI_OUTPUT_DIR, exist_ok=True)

def preprocess_image(image_path: str, size: tuple) -> np.ndarray:
    """Loads and preprocesses image for a given model size."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")

    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

    img = cv2.resize(img, size)
    img_array = img / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def extract_facts_from_mask(mask: np.ndarray) -> Dict[str, Any]:
    """Bridge from neural output to symbolic facts."""
    print("Extracting real facts from mask...")

    threshold_val = 127 if mask.max() > 1 else 0.5
    _, mask_binarized = cv2.threshold(mask, threshold_val, 255, cv2.THRESH_BINARY)
    mask_binarized = mask_binarized.astype(np.uint8)
    pixels = cv2.countNonZero(mask_binarized)
    PIXEL_AREA_PER_CM2 = 500 
    volume_cm2 = pixels / PIXEL_AREA_PER_CM2
    lobes = []
    moments = cv2.moments(mask_binarized)
    if moments["m00"] > 0:
        center_y = int(moments["m01"] / moments["m00"])
        height = IMAGE_SIZE_SEGMENT[1]
        if center_y < (height / 3):
            lobes.append("frontal_lobe")
        elif center_y > (height * 2 / 3):
            lobes.append("temporal_lobe")
        else:
            lobes.append("parietal_lobe")

    irregularity = 0.0
    contours, _ = cv2.findContours(mask_binarized, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(contours) > 0:
        contour = max(contours, key=cv2.contourArea)
        perimeter = cv2.arcLength(contour, True)
        area = cv2.contourArea(contour)
        if perimeter > 0:
            circularity = (4 * np.pi * area) / (perimeter * perimeter)
            irregularity = 1.0 - circularity 

    return {
        "tumor_volume_cm2": round(volume_cm2, 2),
        "affected_lobes": lobes,
        "shape_irregularity": round(irregularity, 2),
    }

async def run_simple_analysis(
    image_path: str,
    original_filename: str,
    clf_model,
    seg_model
) -> Dict[str, Any]:
    
    if clf_model is None or seg_model is None:
        raise Exception("AI Models are not loaded. Server configuration error.")

    print("--- Running 2-Stage Neurosymbolic Pipeline ---")
    print("Stage 1: Running Classification...")
    img_array_classify = preprocess_image(image_path, IMAGE_SIZE_CLASSIFY)
    predictions = clf_model.predict(img_array_classify)
    confidence = float(np.max(predictions))
    predicted_class_index = int(np.argmax(predictions))
    predicted_class = CLASSES[predicted_class_index]

    prediction_results = {
        "predicted_class": predicted_class,
        "confidence": confidence,
    }
    print(f"Classification result: {prediction_results}")
    print("Stage 2: Running Segmentation & Fact Extraction...")
    grad_cam_path_url = "null"
    seg_mask_path_url = "null"
    ai_facts = {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "tumor_volume_cm2": 0,
        "affected_lobes": [],
        "shape_irregularity": 0,
    }

    if predicted_class != "notumor":
        print("Generating Grad-CAM...")
        heatmap = generate_grad_cam(
            clf_model, img_array_classify, LAST_CONV_LAYER_NAME, pred_index=predicted_class_index
        )
        grad_cam_filename = f"gradcam_{original_filename}"
        grad_cam_output_path = os.path.join(XAI_OUTPUT_DIR, grad_cam_filename)
        save_grad_cam_overlay(image_path, heatmap, grad_cam_output_path)
        grad_cam_path_url = f"/uploads/xai_outputs/{grad_cam_filename}"
        
        img_array_segment = preprocess_image(image_path, IMAGE_SIZE_SEGMENT)
        mask = seg_model.predict(img_array_segment)
        mask_2d = np.squeeze(mask[0])

        print(f"DEBUG: Mask Min={mask_2d.min():.4f}, Max={mask_2d.max():.4f}")

        final_mask_uint8 = None

        if mask_2d.max() > 0.01:
            print("✅ U-Net found a tumor region.")
            mask_norm = cv2.normalize(mask_2d, None, 0, 255, cv2.NORM_MINMAX)
            final_mask_uint8 = mask_norm.astype(np.uint8)
            _, final_mask_uint8 = cv2.threshold(final_mask_uint8, 100, 255, cv2.THRESH_BINARY)
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            final_mask_uint8 = cv2.morphologyEx(final_mask_uint8, cv2.MORPH_CLOSE, kernel)
            final_mask_uint8 = cv2.morphologyEx(final_mask_uint8, cv2.MORPH_OPEN, kernel)
            
            contours, _ = cv2.findContours(final_mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                final_mask_uint8 = np.zeros_like(final_mask_uint8)
                cv2.drawContours(final_mask_uint8, [largest_contour], -1, 255, -1)
                print(f"   Refined to largest tumor region (area: {cv2.contourArea(largest_contour):.0f} pixels)")
            
        else:
            print("⚠️ U-Net returned blank. Falling back to Grad-CAM attention mask.")
            
            grad_cam_resized = cv2.resize(heatmap, (256, 256))

            if len(grad_cam_resized.shape) == 3:
                grad_cam_resized = cv2.cvtColor(grad_cam_resized, cv2.COLOR_BGR2GRAY)
            grad_cam_resized = cv2.normalize(grad_cam_resized, None, 0, 255, cv2.NORM_MINMAX)
            grad_cam_uint8 = grad_cam_resized.astype(np.uint8)
            _, final_mask_uint8 = cv2.threshold(grad_cam_uint8, 180, 255, cv2.THRESH_BINARY)
            
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            final_mask_uint8 = cv2.morphologyEx(final_mask_uint8, cv2.MORPH_CLOSE, kernel)
            final_mask_uint8 = cv2.morphologyEx(final_mask_uint8, cv2.MORPH_OPEN, kernel)
            contours, _ = cv2.findContours(final_mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                final_mask_uint8 = np.zeros_like(final_mask_uint8)
                cv2.drawContours(final_mask_uint8, [largest_contour], -1, 255, -1)
                print(f"   Extracted tumor core from Grad-CAM (area: {cv2.contourArea(largest_contour):.0f} pixels)")

        seg_mask_filename = f"segmask_{original_filename}"
        seg_mask_output_path = os.path.join(XAI_OUTPUT_DIR, seg_mask_filename)
        
        try:
            save_segmentation_overlay(
                image_path=image_path,
                mask=final_mask_uint8,
                output_path=seg_mask_output_path,
                alpha=0.5,  
                use_red_overlay=True  
            )
            print(f"✅ Colored segmentation overlay saved to {seg_mask_output_path}")
        except Exception as e:
            print(f"⚠️ Failed to create colored overlay, falling back to plain mask: {e}")
            cv2.imwrite(seg_mask_output_path, final_mask_uint8)
        
        seg_mask_path_url = f"/uploads/xai_outputs/{seg_mask_filename}"
        real_facts = extract_facts_from_mask(final_mask_uint8)
        ai_facts.update(real_facts)

    else:
        print("No tumor predicted. Skipping segmentation.")

    print("Stage 3: Running Symbolic Reasoning...")
    explanation = simple_reasoner.generate_explanation(ai_facts)
    treatment_plan = simple_reasoner.generate_treatment_plan(ai_facts)

    return {
        "prediction": prediction_results,
        "explanation": explanation,
        "treatment": treatment_plan, 
        "ai_facts": ai_facts,
        "image_paths": {
            "original": image_path,
            "grad_cam": grad_cam_path_url,
            "seg_mask": seg_mask_path_url,
        },
    }