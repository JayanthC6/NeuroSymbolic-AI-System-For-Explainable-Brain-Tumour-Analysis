"""
BraTS 2021 3D to 2D Preprocessing Script

This script does the following:
1.  Finds all BraTS 2021 patient folders.
2.  Loads the 3D FLAIR (input) and SEG (mask) .nii.gz files.
3.  Slices them along the Z-axis.
4.  Filters out any slices that do not contain a tumor.
5.  Normalizes and saves the "good" slices as 2D PNG files.
"""

import os
import glob
import numpy as np
import nibabel as nib  # The library for .nii.gz files
import cv2  # OpenCV for saving images
from tqdm import tqdm  # The progress bar library

# --- 1. CONFIGURATION ---

# --- ⚠️ UPDATE THIS PATH ---
# Point this to the folder you unzipped, e.g., "C:/Users/jayanth/Downloads/BraTS2021_Task1/TrainingData"
# It should be the folder that CONTAINS all the BraTS2021_XXXXX patient folders.
BRATS_DATA_PATH = "C:/Users/jayanth/Downloads/archive (8)/BraTS2021_Training_Data"
# --- ⚠️ ---

# The output folder where we will save the 2D slices
OUTPUT_PATH = "data_2d"

# The 2D size we want for our images
IMAGE_SIZE = 256

# --- 2. HELPER FUNCTIONS ---

def normalize(data: np.ndarray) -> np.ndarray:
    """Normalizes input data to 0-255 uint8 range."""
    # Squeeze to 2D
    data = np.squeeze(data)
    # Normalize to 0-1
    data = (data - np.min(data)) / (np.max(data) - np.min(data) + 1e-9)
    # Scale to 0-255
    data = (data * 255).astype(np.uint8)
    return data

def process_and_save_slice(image_slice, mask_slice, patient_id, slice_num, output_path):
    """
    Saves a single 2D image slice and its corresponding mask.
    """
    # 1. Get the paths
    img_save_path = os.path.join(output_path, "images", f"{patient_id}_{slice_num}.png")
    mask_save_path = os.path.join(output_path, "masks", f"{patient_id}_{slice_num}.png")

    # 2. Normalize the input image slice
    image_slice = normalize(image_slice)
    
    # 3. Process the mask
    # The BraTS masks have values 0, 1, 2, 4. We want a simple binary mask (0 or 255).
    # We'll make any pixel that is NOT 0 (background) into 255 (tumor).
    mask_slice = (mask_slice > 0).astype(np.uint8) * 255

    # 4. Resize both to our target IMAGE_SIZE
    image_slice = cv2.resize(image_slice, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)
    mask_slice = cv2.resize(mask_slice, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_NEAREST)

    # 5. Save the 2D .png files
    cv2.imwrite(img_save_path, image_slice)
    cv2.imwrite(mask_save_path, mask_slice)

# --- 3. MAIN SCRIPT ---
def main():
    print("Starting 3D to 2D preprocessing...")
    
    # 1. Create output directories
    os.makedirs(os.path.join(OUTPUT_PATH, "images"), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_PATH, "masks"), exist_ok=True)
    
    # 2. Find all patient folders
    patient_folders = glob.glob(os.path.join(BRATS_DATA_PATH, "BraTS2021_*"))
    
    if not patient_folders:
        print(f"ERROR: No patient folders found at '{BRATS_DATA_PATH}'.")
        print("Please check the 'BRATS_DATA_PATH' variable in this script.")
        return

    print(f"Found {len(patient_folders)} patient folders. Starting conversion...")
    
    total_slices_saved = 0
    
    # 3. Loop through each patient
    for folder_path in tqdm(patient_folders, desc="Processing Patients"):
        patient_id = os.path.basename(folder_path)
        
        # 4. Find the required files (FLAIR and SEG)
        try:
            flair_path = glob.glob(os.path.join(folder_path, "*_flair.nii.gz"))[0]
            seg_path = glob.glob(os.path.join(folder_path, "*_seg.nii.gz"))[0]
        except IndexError:
            print(f"Warning: Skipping {patient_id}, missing flair or seg file.")
            continue
            
        # 5. Load the 3D files
        flair_img = nib.load(flair_path).get_fdata() # This is a 3D (X, Y, Z) array
        seg_img = nib.load(seg_path).get_fdata()
        
        # 6. Iterate through the "Z" axis (the slices)
        # flair_img.shape[2] gives us the number of slices
        for z in range(flair_img.shape[2]):
            image_slice = flair_img[:, :, z]
            mask_slice = seg_img[:, :, z]
            
            # 7. --- THIS IS THE CRITICAL STEP ---
            # We check if the mask slice has any tumor in it.
            # If np.sum(mask_slice) is 0, it's an empty slice and we skip it.
            if np.sum(mask_slice) > 0:
                # This slice has a tumor, so we save it
                process_and_save_slice(
                    image_slice=image_slice,
                    mask_slice=mask_slice,
                    patient_id=patient_id,
                    slice_num=z,
                    output_path=OUTPUT_PATH
                )
                total_slices_saved += 1
                
    print("\n--- Preprocessing Complete! ---")
    print(f"Total 2D slices saved: {total_slices_saved}")
    print(f"Your 2D dataset is ready in the '{OUTPUT_PATH}' folder.")

if __name__ == "__main__":
    main()