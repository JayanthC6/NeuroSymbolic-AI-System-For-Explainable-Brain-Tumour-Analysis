import tensorflow as tf
import os

model_path = "models/model.h5"

if not os.path.exists(model_path):
    print(f"ERROR: Model file not found at '{model_path}'. Please run train_model.py first.")
    exit()

print(f"Loading new model from: {model_path}")
try:
    model = tf.keras.models.load_model(model_path, compile=False)
    print("\n--- 1. Top-Level Model Summary ---")
    model.summary()
    base_model_layer_name = 'vgg16' 
    try:
        vgg16_base_model = model.get_layer(base_model_layer_name)
        print(f"\n\n--- 2. Zoomed-in '{base_model_layer_name}' Layer Summary ---")
        print("We are looking for the LAST 'conv' layer in THIS list:")
        vgg16_base_model.summary()
        print("\nFind the last layer with 'conv' in its name (e.g., block5_conv3).")
    except ValueError:
        print(f"\nCould not find a layer named '{base_model_layer_name}' in the top-level model.")
        print("Please check the first summary above for the correct name of the base model layer.")

except Exception as e:
    print(f"\nERROR loading model: {e}")
    print("The model file might still be incompatible or corrupted.")