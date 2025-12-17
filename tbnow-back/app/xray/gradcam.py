import torch, cv2, uuid
import numpy as np
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=RuntimeWarning)

def generate_cam(model, input_tensor, original_image):
    activations = []
    gradients = []

    def forward_hook(_, __, output):
        activations.append(output)

    def backward_hook(_, grad_in, grad_out):
        gradients.append(grad_out[0])

    layer = model.layer4[-1]
    layer.register_forward_hook(forward_hook)
    layer.register_backward_hook(backward_hook)

    output = model(input_tensor)
    pred_class = 1  # Class for TB
    output[0, pred_class].backward()

    weights = gradients[0].mean(dim=[2,3], keepdim=True)
    cam = (weights * activations[0]).sum(dim=1).squeeze()
    cam = cam.clamp(min=0).detach().numpy()
    
    # Normalize CAM, handling edge case where max is 0
    cam_max = cam.max()
    if cam_max > 0:
        cam = cam / cam_max
    else:
        # If all values are 0, create a uniform heatmap
        cam = np.ones_like(cam) * 0.5

    cam = cv2.resize(cam, original_image.size)
    
    # Ensure cam values are valid (handle any remaining NaN/inf values)
    cam = np.nan_to_num(cam, nan=0.0, posinf=1.0, neginf=0.0)
    cam = np.clip(cam, 0.0, 1.0)
    
    heatmap = cv2.applyColorMap((cam*255).astype("uint8"), cv2.COLORMAP_JET)

    # Ensure original_image is RGB
    if original_image.mode != 'RGB':
        original_image = original_image.convert('RGB')

    overlay = cv2.addWeighted(
        np.array(original_image), 0.6, heatmap, 0.4, 0
    )

    filename = f"{uuid.uuid4()}.png"
    path = f"static/heatmaps/{filename}"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    cv2.imwrite(path, overlay)

    return f"/static/heatmaps/{filename}"
