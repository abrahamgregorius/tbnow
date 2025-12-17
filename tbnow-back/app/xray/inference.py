import torch
from PIL import Image
import torchvision.transforms as T
from .model import load_tb_model
from .gradcam import generate_cam
import warnings
import os

# Suppress warnings
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=RuntimeWarning)

# Validate model exists before loading
model_path = os.path.join(os.path.dirname(__file__), "model_tb.pth")
if not os.path.exists(model_path):
    print(f"WARNING: Model file not found at {model_path}")
    print("X-ray analysis will not work properly!")
    model = None
else:
    try:
        model = load_tb_model()
        print("X-ray model loaded successfully")
    except Exception as e:
        print(f"ERROR loading X-ray model: {e}")
        model = None

transform = T.Compose([
    T.Resize((224, 224)),
    T.Grayscale(3),
    T.ToTensor(),
    T.Normalize([0.485,0.456,0.406], [0.229,0.224,0.225])
])

transform = T.Compose([
    T.Resize((224, 224)),
    T.Grayscale(3),
    T.ToTensor(),
    T.Normalize([0.485,0.456,0.406], [0.229,0.224,0.225])
])

def quick_screen(image: Image.Image):
    # Check if model is available
    if model is None:
        return {
            "risk_level": "Error",
            "confidence": 0.0,
            "observations": "Model tidak dapat dimuat. Silakan periksa file model_tb.pth.",
            "recommendations": "Hubungi administrator sistem untuk memperbaiki model X-ray.",
            "follow_up_questions": [],
            "heatmap_url": None,
            "note": "Sistem X-ray analysis tidak tersedia"
        }

    x = transform(image).unsqueeze(0)
    x.requires_grad = True

    output = model(x)
    probabilities = torch.softmax(output, dim=1)
    prob_tb = probabilities[0, 1].item()  # Probability of TB (class 1)
    prob_normal = probabilities[0, 0].item()  # Probability of Normal (class 0)

    # Debug logging (can be removed in production)
    print(f"X-ray Analysis - TB: {prob_tb:.3f}, Normal: {prob_normal:.3f}")

    heatmap_path = generate_cam(model, x, image)

    # More conservative thresholds for medical diagnosis
    # Require strong evidence for TB detection to avoid false positives
    # Bias toward normal classification for medical safety
    if prob_tb > 0.90 and prob_normal < 0.10:
        risk = "High"
        observations = "Terdeteksi area abnormal pada paru-paru yang menunjukkan kemungkinan infiltrat, kavitas, atau lesi aktif TB. Heatmap menunjukkan area fokal dengan aktivitas tinggi."
        recommendations = "Segera lakukan pemeriksaan klinis lengkap dan konfirmasi diagnosis dengan pemeriksaan sputum BTA, kultur, atau PCR. Pertimbangkan isolasi pasien dan kontak tracing."
        follow_up_questions = [
            "Apakah pasien mengalami gejala batuk berdahak >2 minggu?",
            "Apakah ada riwayat kontak dengan pasien TB?",
            "Apakah pasien mengalami penurunan berat badan?",
            "Apakah ada gejala demam atau keringat malam?"
        ]
    elif prob_tb > 0.80 and prob_normal < 0.20:
        risk = "Medium"
        observations = "Terdapat indikasi abnormalitas pada struktur paru-paru yang memerlukan evaluasi lebih lanjut. Heatmap menunjukkan area dengan aktivitas sedang yang perlu diperhatikan."
        recommendations = "Lakukan pemeriksaan klinis menyeluruh dan pertimbangkan pemeriksaan penunjang tambahan seperti tes sputum atau rontgen berulang dalam 2-4 minggu."
        follow_up_questions = [
            "Apakah pasien memiliki gejala pernapasan?",
            "Apakah ada faktor risiko TB seperti HIV atau diabetes?",
            "Berapa lama gejala sudah dirasakan?",
            "Apakah pasien perokok atau memiliki riwayat TB sebelumnya?"
        ]
    else:
        risk = "Low"
        observations = "Struktur paru-paru tampak normal tanpa indikasi signifikan kelainan TB. Heatmap menunjukkan aktivitas rendah pada area paru-paru."
        recommendations = "Lanjutkan pemantauan rutin kesehatan. Jika muncul gejala baru, segera konsultasikan dengan tenaga kesehatan."
        follow_up_questions = [
            "Apakah ada gejala batuk atau sesak napas?",
            "Apakah ada riwayat kontak dengan pasien TB?",
            "Apakah ada faktor risiko seperti malnutrisi atau immunosupresi?",
            "Kapan pemeriksaan kesehatan terakhir dilakukan?"
        ]

    return {
        "risk_level": risk,
        "confidence": round(prob_tb, 2),
        "observations": observations,
        "recommendations": recommendations,
        "follow_up_questions": follow_up_questions,
        "heatmap_url": heatmap_path,
        "note": "Hasil ini bukan diagnosis definitif dan harus dikonfirmasi oleh tenaga kesehatan profesional"
    }
