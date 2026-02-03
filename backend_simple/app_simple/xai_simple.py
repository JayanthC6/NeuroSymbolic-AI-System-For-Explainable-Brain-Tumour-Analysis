import traceback
from typing import Optional, Tuple
import numpy as np
import tensorflow as tf
import cv2
import os


def generate_grad_cam(model, img_array, last_conv_layer_name='block5_conv3', pred_index=None):
    import traceback
    import numpy as np
    import tensorflow as tf
    import cv2

    print("XAI: Starting generate_grad_cam...")

    try:
        if img_array.ndim == 3:
            img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.astype(np.float32)

        try:
            base_model = model.get_layer('vgg16')
            print("XAI: Found inner base model 'vgg16'")
        except Exception:
            base_model = model
            print("XAI: Using model directly")

        last_conv_layer = base_model.get_layer(last_conv_layer_name)
        print(f"XAI: Using conv layer '{last_conv_layer_name}'")
        grad_model = tf.keras.models.Model(
            inputs=base_model.input,
            outputs=[last_conv_layer.output, base_model.output]
        )

        print("XAI: grad_model ready, running forward pass...")
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array, training=False)

            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            class_channel = predictions[:, pred_index]

        grads = tape.gradient(class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        conv_outputs = conv_outputs[0].numpy()
        pooled_grads = pooled_grads.numpy()

        for i in range(pooled_grads.shape[-1]):
            conv_outputs[:, :, i] *= pooled_grads[i]

        heatmap = np.mean(conv_outputs, axis=-1)
        heatmap = np.maximum(heatmap, 0)
        heatmap /= np.max(heatmap) if np.max(heatmap) != 0 else 1
        heatmap = np.float32(heatmap)

        print("XAI: Grad-CAM heatmap generated successfully!")
        return heatmap

    except Exception as e:
        print(f"XAI ERROR in generate_grad_cam: {e}")
        traceback.print_exc()
        raise



def save_grad_cam_overlay(
    image_path: str,
    heatmap: np.ndarray,
    output_path: str,
    alpha: float = 0.5,
    resize_to: Optional[Tuple[int, int]] = None,
) -> str:
    """
    Save heatmap overlayed on original image.

    Args:
        image_path: path to the original image file (used for overlay and size reference).
        heatmap: 2D numpy array in [0,1].
        output_path: where to save the overlayed image.
        alpha: blending factor.
        resize_to: if provided, (width, height) to resize original image before overlay.

    Returns:
        output_path (str) on success.

    Raises:
        Exception on failure.
    """
    print("XAI: Starting save_grad_cam_overlay...")
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Original image not found: {image_path}")

        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"cv2.imread failed for: {image_path}")

        if resize_to is not None:
            img = cv2.resize(img, resize_to)

        h, w = img.shape[:2]

        heatmap = heatmap.astype(np.float32)
        if heatmap.max() > 1.0:
            heatmap = heatmap / 255.0

        heatmap_resized = cv2.resize(heatmap, (w, h))

        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(img, 1 - alpha, heatmap_colored, alpha, 0)
        success = cv2.imwrite(output_path, overlay)
        if not success:
            raise IOError(f"Failed to write overlay image to {output_path}")

        print(f"XAI: Saved Grad-CAM overlay to {output_path}")
        return output_path

    except Exception as e:
        print(f"XAI ERROR in save_grad_cam_overlay: {e}")
        traceback.print_exc()
        raise


def save_segmentation_overlay(
    image_path: str,
    mask: np.ndarray,
    output_path: str,
    alpha: float = 0.5,
    use_red_overlay: bool = True,
) -> str:
    """
    Save tumor segmentation mask overlayed on original MRI image with prominent red coloring.
    
    Args:
        image_path: path to the original MRI image file.
        mask: 2D binary mask (0-255 uint8) where white=tumor region.
        output_path: where to save the overlayed image.
        alpha: blending factor (0.5 = 50% tumor color, 50% original image).
        use_red_overlay: if True, use pure red color; if False, use hot colormap.
    
    Returns:
        output_path (str) on success.
    """
    print("XAI: Starting save_segmentation_overlay...")
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Original image not found: {image_path}")
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"cv2.imread failed for: {image_path}")
        
        h, w = img.shape[:2]
    
        if mask.dtype != np.uint8:
            mask = mask.astype(np.uint8)
        mask_resized = cv2.resize(mask, (w, h))
        mask_binary = (mask_resized > 127).astype(np.uint8)
        
        if use_red_overlay:
            red_overlay = np.zeros_like(img)
            red_overlay[:, :, 2] = mask_binary * 255  
            overlay = cv2.addWeighted(img, 1.0, red_overlay, alpha, 0)
        else:
            mask_colored = cv2.applyColorMap(mask_resized, cv2.COLORMAP_HOT)
            mask_3channel = cv2.cvtColor(mask_binary * 255, cv2.COLOR_GRAY2BGR)
            colored_tumor = cv2.bitwise_and(mask_colored, mask_3channel)
            overlay = cv2.addWeighted(img, 1.0, colored_tumor, alpha, 0)
        
        success = cv2.imwrite(output_path, overlay)
        if not success:
            raise IOError(f"Failed to write segmentation overlay to {output_path}")
        
        print(f"XAI: Saved segmentation overlay to {output_path} (red_overlay={use_red_overlay}, alpha={alpha})")
        return output_path
    
    except Exception as e:
        print(f"XAI ERROR in save_segmentation_overlay: {e}")
        traceback.print_exc()
        raise
