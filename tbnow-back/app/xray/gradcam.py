import torch, cv2, uuid
import numpy as np

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
    cam = cam / cam.max()

    cam = cv2.resize(cam, original_image.size)
    heatmap = cv2.applyColorMap((cam*255).astype("uint8"), cv2.COLORMAP_JET)

    # Ensure original_image is RGB
    if original_image.mode != 'RGB':
        original_image = original_image.convert('RGB')

    overlay = cv2.addWeighted(
        np.array(original_image), 0.6, heatmap, 0.4, 0
    )

    filename = f"{uuid.uuid4()}.png"
    path = f"static/heatmaps/{filename}"
    cv2.imwrite(path, overlay)

    return f"/static/heatmaps/{filename}"
