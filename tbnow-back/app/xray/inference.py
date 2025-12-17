import torch
from PIL import Image
import torchvision.transforms as T
from .model import load_tb_model
from .gradcam import generate_cam

model = load_tb_model()

transform = T.Compose([
    T.Resize((224, 224)),
    T.Grayscale(3),
    T.ToTensor(),
    T.Normalize([0.485,0.456,0.406], [0.229,0.224,0.225])
])

def quick_screen(image: Image.Image):
    x = transform(image).unsqueeze(0)
    x.requires_grad = True

    output = model(x)
    probabilities = torch.softmax(output, dim=1)
    prob_tb = probabilities[0, 1].item()  # Probability of TB (class 1)

    heatmap_path = generate_cam(model, x, image)

    if prob_tb > 0.75:
        risk = "High"
    elif prob_tb > 0.4:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "risk_level": risk,
        "confidence": round(prob_tb, 2),
        "heatmap_url": heatmap_path,
        "note": "Not a diagnosis"
    }
