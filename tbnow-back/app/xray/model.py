import torch
import torchvision.models as models
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model architecture
model = models.resnet18(weights=None)  # must match your training
model.fc = nn.Linear(model.fc.in_features, 2)  # TB vs Normal

# Load weights (adjust path if needed)
model_path = os.path.join(os.path.dirname(__file__), "model_tb.pth")
model.load_state_dict(torch.load(model_path, map_location=device))
model = model.to(device)
model.eval()

def load_tb_model():
    return model

# Preprocess image
def preprocess_image(image: Image.Image):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # Adjust size as per training
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # ImageNet norms
    ])
    return transform(image).unsqueeze(0).to(device)

# Predict
def predict(image_tensor):
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, 1)
        return predicted.item(), confidence.item()

# Risk level
def get_risk_level(pred, conf):
    if pred == 1:  # TB
        if conf > 0.8:
            return "High"
        elif conf > 0.6:
            return "Medium"
        else:
            return "Low"
    else:
        return "Low"  # Normal

# Main analysis
def analyze_xray(image: Image.Image):
    image_tensor = preprocess_image(image)
    pred, conf = predict(image_tensor)
    risk = get_risk_level(pred, conf)
    return {
        "risk_level": risk,
        "confidence": round(conf, 2),
        "prediction": "TB" if pred == 1 else "Normal",
        "note": "Not a medical diagnosis"
    }
