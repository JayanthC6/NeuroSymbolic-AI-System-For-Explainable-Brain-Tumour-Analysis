"""
BraTS 2021 2D U-Net Training Script

This script does the following:
1.  Loads all image and mask file paths from the 'data_2d' folder.
2.  Splits them into training (90%) and validation (10%) sets.
3.  Creates a data generator to feed images to the model in batches.
4.  Defines the 2D U-Net model architecture.
5.  Defines the Dice Loss function (critical for segmentation).
6.  Trains the model.
7.  Saves the final model as 'segmentation_model.h5'.
"""

import os
import numpy as np
import cv2
import tensorflow as tf
from sklearn.model_selection import train_test_split
from glob import glob

# --- 1. Configuration ---
DATA_PATH = "data_2d" # The folder created by preprocess_brats.py
IMAGE_SIZE = 256 # Must match the size from the preprocessing script
BATCH_SIZE = 16   # How many images to train on at once. Lower if you run out of memory.
EPOCHS = 10       # How many times to loop over the data. 10 is a good start.

# --- 2. Data Loading ---

def load_data(data_path):
    """
    Loads all file paths and splits them into train/validation sets.
    """
    images = sorted(glob(os.path.join(data_path, "images", "*.png")))
    masks = sorted(glob(os.path.join(data_path, "masks", "*.png")))
    
    # We have 81,437 images. Let's use 10% for validation.
    test_size = int(len(images) * 0.1)
    
    train_x, valid_x = train_test_split(images, test_size=test_size, random_state=42)
    train_y, valid_y = train_test_split(masks, test_size=test_size, random_state=42)
    
    return (train_x, train_y), (valid_x, valid_y)

def data_generator(image_paths, mask_paths, batch_size):
    """
    A Python generator to feed data to model.fit() in batches.
    This is necessary because we can't load 80,000 images into RAM.
    """
    L = len(image_paths)
    while True:
        # Create empty arrays to hold one batch
        batch_img = np.zeros((batch_size, IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.float32)
        batch_mask = np.zeros((batch_size, IMAGE_SIZE, IMAGE_SIZE, 1), dtype=np.float32)
        
        # Get a batch of random indices
        indices = np.random.choice(L, batch_size)
        
        for i, index in enumerate(indices):
            # Load image
            img = cv2.imread(image_paths[index], cv2.IMREAD_COLOR)
            img = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
            img = img / 255.0 # Normalize to 0-1
            
            # Load mask
            mask = cv2.imread(mask_paths[index], cv2.IMREAD_GRAYSCALE)
            mask = cv2.resize(mask, (IMAGE_SIZE, IMAGE_SIZE))
            mask = mask / 255.0 # Normalize to 0-1
            mask = np.expand_dims(mask, axis=-1) # Add channel dimension
            
            batch_img[i] = img
            batch_mask[i] = mask
            
        # yield returns the data and pauses the function
        yield batch_img, batch_mask

# --- 3. U-Net Model Architecture ---
# This is our "algorithm reference"
# 

#[Image of U-Net architecture diagram]


def build_unet(input_shape):
    """
    Builds the 2D U-Net model.
    """
    inputs = tf.keras.layers.Input(input_shape)

    # --- Encoder (Contracting Path) ---
    # Block 1
    c1 = tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same')(inputs)
    c1 = tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same')(c1)
    p1 = tf.keras.layers.MaxPooling2D((2, 2))(c1)

    # Block 2
    c2 = tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same')(p1)
    c2 = tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same')(c2)
    p2 = tf.keras.layers.MaxPooling2D((2, 2))(c2)

    # --- Bottleneck ---
    b = tf.keras.layers.Conv2D(256, (3, 3), activation='relu', padding='same')(p2)
    b = tf.keras.layers.Conv2D(256, (3, 3), activation='relu', padding='same')(b)

    # --- Decoder (Expanding Path) ---
    # Block 6 (Up-sample + skip connection)
    u6 = tf.keras.layers.Conv2DTranspose(128, (2, 2), strides=(2, 2), padding='same')(b)
    u6 = tf.keras.layers.concatenate([u6, c2]) # This is the skip connection
    c6 = tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same')(u6)
    c6 = tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same')(c6)

    # Block 7
    u7 = tf.keras.layers.Conv2DTranspose(64, (2, 2), strides=(2, 2), padding='same')(c6)
    u7 = tf.keras.layers.concatenate([u7, c1]) # This is the skip connection
    c7 = tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same')(u7)
    c7 = tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same')(c7)

    # --- Output Layer ---
    # 1x1 Conv with sigmoid activation for binary segmentation
    outputs = tf.keras.layers.Conv2D(1, (1, 1), activation='sigmoid')(c7)

    model = tf.keras.Model(inputs=[inputs], outputs=[outputs])
    return model

# --- 4. Dice Loss Function ---
# 
def dice_loss(y_true, y_pred, smooth=1e-6):
    """
    Dice Loss is the standard loss function for segmentation.
    It measures how much the predicted mask overlaps with the true mask.
    """
    y_true_f = tf.keras.layers.Flatten()(y_true)
    y_pred_f = tf.keras.layers.Flatten()(y_pred)
    intersection = tf.reduce_sum(y_true_f * y_pred_f)
    return 1 - ( (2. * intersection + smooth) / (tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) + smooth) )

# --- 5. Main Training Function ---
def main():
    print("Loading and splitting data...")
    (train_x, train_y), (valid_x, valid_y) = load_data(DATA_PATH)
    print(f"Data loaded: {len(train_x)} training, {len(valid_x)} validation.")

    print("Creating data generators...")
    train_gen = data_generator(train_x, train_y, BATCH_SIZE)
    valid_gen = data_generator(valid_x, valid_y, BATCH_SIZE)

    print("Building U-Net model...")
    model = build_unet((IMAGE_SIZE, IMAGE_SIZE, 3))
    
    # We compile with Dice Loss
    model.compile(optimizer='adam', loss=dice_loss, metrics=['accuracy'])
    
    model.summary()
    
    print("\n--- Starting Model Training ---")
    
    # Calculate steps per epoch
    train_steps = len(train_x) // BATCH_SIZE
    valid_steps = len(valid_x) // BATCH_SIZE

    # Train the model
    model.fit(
        train_gen,
        validation_data=valid_gen,
        steps_per_epoch=train_steps,
        validation_steps=valid_steps,
        epochs=EPOCHS
    )
    
    print("\n--- Training Complete ---")
    
    # Save the final model
    model.save("segmentation_model.h5")
    print("Model saved as 'segmentation_model.h5'.")
    print("You can now move this file to your 'backend_simple/models/' folder.")

if __name__ == "__main__":
    main()