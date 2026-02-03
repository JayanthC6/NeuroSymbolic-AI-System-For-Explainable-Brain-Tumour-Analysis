import os
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CLASSIFICATION_MODEL_PATH = os.path.join(BASE_DIR, "models", "model.h5")
SEGMENTATION_MODEL_PATH = os.path.join(BASE_DIR, "models", "segmentation_model.h5")

classification_model = None
segmentation_model = None

def load_models():
    """
    Loads the .h5 files into memory so the AI can run.
    """
    global classification_model, segmentation_model

    if classification_model is not None and segmentation_model is not None:
        return  

    print("⏳ Loading AI models from disk...")

    try:
        if os.path.exists(CLASSIFICATION_MODEL_PATH):
            classification_model = tf.keras.models.load_model(CLASSIFICATION_MODEL_PATH, compile=False)
            print(f"✅ Classification model loaded: {CLASSIFICATION_MODEL_PATH}")
        else:
            print(f"❌ Error: File not found at {CLASSIFICATION_MODEL_PATH}")

        if os.path.exists(SEGMENTATION_MODEL_PATH):
            segmentation_model = tf.keras.models.load_model(SEGMENTATION_MODEL_PATH, compile=False)
            print(f"✅ Segmentation model loaded: {SEGMENTATION_MODEL_PATH}")
        else:
            print(f"❌ Error: File not found at {SEGMENTATION_MODEL_PATH}")

    except Exception as e:
        print(f"🔥 Error loading models: {e}")