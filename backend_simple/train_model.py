# train_model.py
import os
import numpy as np
import random
from PIL import Image, ImageEnhance
from tensorflow.keras.preprocessing.image import load_img
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Flatten, Dropout, Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.applications import VGG16
from sklearn.utils import shuffle

# --- SETTINGS ---
# This MUST match the folder you downloaded from Google Drive
train_dir = 'MRI Images/Training/'
test_dir = 'MRI Images/Testing/' # Not used for training, but good to define
IMAGE_SIZE = 128 # From your original script
batch_size = 20
epochs = 5 # Set to 5 for speed, can increase later if needed

# --- 1. Load Data Paths ---
print("Loading image paths...")
if not os.path.exists(train_dir):
    print(f"ERROR: Training directory not found at '{train_dir}'. Make sure 'MRI Images' folder is inside 'backend_simple'.")
    exit()

train_paths = []
train_labels= []

for label in os.listdir(train_dir):
  # Skip non-directory files if any
  label_path = os.path.join(train_dir, label)
  if not os.path.isdir(label_path):
      continue
  for image in os.listdir(label_path):
    train_paths.append(os.path.join(train_dir, label, image))
    train_labels.append(label)

if not train_paths:
    print(f"ERROR: No images found in '{train_dir}'. Check the subfolders.")
    exit()

train_paths, train_labels = shuffle(train_paths, train_labels)

# Get unique labels for the output layer
unique_labels = sorted([d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))]) # Ensure consistent order
num_classes = len(unique_labels)
print(f"Found {num_classes} classes: {unique_labels}")

# --- 2. Image Augmentation & Loading ---
def augment_image(image):
    image = Image.fromarray(np.uint8(image))
    image = ImageEnhance.Brightness(image).enhance(random.uniform(0.8, 1.2))
    image = ImageEnhance.Contrast(image).enhance(random.uniform(0.8, 1.2))
    image = np.array(image) / 255.0 # Normalize
    return image

def open_images(paths):
    images = []
    for path in paths:
        try:
            image = load_img(path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
            image = augment_image(image)
            images.append(image)
        except Exception as e:
            print(f"Warning: Could not load image {path}. Error: {e}")
            continue # Skip corrupted images
    return np.array(images)

def encode_label(labels):
    encoded = [unique_labels.index(label) for label in labels]
    return np.array(encoded)

# --- 3. Data Generator ---
def datagen(paths, labels, batch_size=12, epochs=1):
    num_samples = len(paths)
    if num_samples == 0:
        raise ValueError("No valid image paths found for the data generator.")
    for _ in range(epochs):
      indices = np.arange(num_samples)
      np.random.shuffle(indices)
      paths_shuffled = np.array(paths)[indices]
      labels_shuffled = np.array(labels)[indices]
      for i in range(0, num_samples, batch_size):
          batch_paths = paths_shuffled[i:i + batch_size]
          batch_images = open_images(batch_paths)
          if len(batch_images) == 0: # Handle cases where a whole batch fails to load
              print(f"Warning: Batch starting at index {i} failed to load any images.")
              continue
          batch_labels = labels_shuffled[i:i + batch_size]
          batch_labels = encode_label(batch_labels)
          yield batch_images, batch_labels

# --- 4. Define Model Architecture ---
print("Building VGG16 model...")
base_model = VGG16(input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3), include_top=False, weights='imagenet')

for layer in base_model.layers:
    layer.trainable = False

# Make sure enough layers exist before trying to unfreeze
if len(base_model.layers) >= 4:
    base_model.layers[-2].trainable = True
    base_model.layers[-3].trainable = True
    base_model.layers[-4].trainable = True
else:
    print("Warning: VGG16 base model has fewer than 4 layers, cannot unfreeze last few.")

model = Sequential()
model.add(Input(shape=(IMAGE_SIZE, IMAGE_SIZE, 3)))
model.add(base_model)
model.add(Flatten())
model.add(Dropout(0.3))
model.add(Dense(128, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(num_classes, activation='softmax')) # Use num_classes

# --- 5. Compile Model ---
model.compile(optimizer=Adam(learning_rate=0.0001),
              loss='sparse_categorical_crossentropy',
              metrics=['sparse_categorical_accuracy'])

model.summary()
print("\nStarting model training...")

# --- 6. Train Model ---
steps = max(1, len(train_paths) // batch_size) # Ensure at least 1 step
history = model.fit(datagen(train_paths, train_labels, batch_size=batch_size, epochs=epochs),
                    epochs=epochs, steps_per_epoch=steps)

print("\nTraining complete!")

# --- 7. Save the New, Compatible Model ---
# Ensure the models directory exists
os.makedirs("models", exist_ok=True)
model_save_path = 'models/model.h5'
model.save(model_save_path)
print(f"\nSuccessfully saved new, compatible model as '{model_save_path}'")