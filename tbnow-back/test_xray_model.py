#!/usr/bin/env python3
"""
TBNow X-ray Model Validation Script
Test the model with sample images to check for false positives
"""

import os
import sys
from PIL import Image
import torch

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.xray.inference import quick_screen

def test_xray_model(image_path):
    """Test the X-ray model with a single image"""
    try:
        # Load and validate image
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return

        image = Image.open(image_path)
        print(f"📊 Testing image: {os.path.basename(image_path)}")
        print(f"   Image size: {image.size}")
        print(f"   Image mode: {image.mode}")

        # Run analysis
        result = quick_screen(image)

        print("\n📋 Analysis Results:")
        print(f"   Risk Level: {result['risk_level']}")
        print(f"   Confidence: {result['confidence']}")
        print(f"   Observations: {result['observations'][:100]}...")
        print(f"   Recommendations: {result['recommendations'][:100]}...")

        # Determine if this is a potential false positive
        if result['risk_level'] in ['High', 'Medium'] and result['confidence'] < 0.85:
            print("\n⚠️  POTENTIAL FALSE POSITIVE DETECTED!")
            print("   Model is flagging normal X-rays as TB risk")
            print(f"   Confidence ({result['confidence']:.3f}) is below safe threshold")
        elif result['risk_level'] == 'Low':
            print("\n✅ Correctly classified as Low risk (Normal)")
        else:
            print("\n✅ High confidence TB detection - may be valid")
        print("-" * 60)

    except Exception as e:
        print(f"❌ Error testing image: {e}")
        print("-" * 60)

def main():
    print("🔍 TBNow X-ray Model Validation Tool")
    print("=" * 60)

    # Test with sample images if they exist
    test_images = [
        "data/xray/train/Normal/sample_normal.png",
        "data/xray/train/TB/sample_tb.png",
        "test_normal_xray.png",  # User can place test images here
        "test_tb_xray.png"
    ]

    found_images = False
    for image_path in test_images:
        if os.path.exists(image_path):
            test_xray_model(image_path)
            found_images = True

    if not found_images:
        print("📂 No test images found. Place X-ray images in the following locations to test:")
        print("   - test_normal_xray.png (for normal lung X-rays)")
        print("   - test_tb_xray.png (for TB X-rays)")
        print("   - data/xray/train/Normal/ (training normal images)")
        print("   - data/xray/train/TB/ (training TB images)")

    print("\n💡 Tips for testing:")
    print("   - Use chest X-ray images in PNG/JPG format")
    print("   - Normal X-rays should show 'Low' risk with confidence < 0.8")
    print("   - TB X-rays should show 'High' risk with confidence > 0.9")
    print("   - If normal X-rays show TB risk, the model needs retraining")

if __name__ == "__main__":
    main()