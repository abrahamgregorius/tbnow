#!/usr/bin/env python3
"""
TBNow Model Training Script
Run this script to train the X-ray TB detection model with updated data
"""

import os
import sys


def main():
    print("🔍 TBNow X-ray Model Training")
    print("=" * 50)

    # Check if data exists
    data_dir = "data/xray"
    if not os.path.exists(data_dir):
        print(f"❌ Data directory not found: {data_dir}")
        print(
            "Please ensure you have X-ray data in data/xray/train/ and data/xray/test/"
        )
        return

    # Check training data
    train_normal = os.path.join(data_dir, "train", "Normal")
    train_tb = os.path.join(data_dir, "train", "TB")
    test_normal = os.path.join(data_dir, "test", "Normal")
    test_tb = os.path.join(data_dir, "test", "TB")

    for path, name in [
        (train_normal, "Train Normal"),
        (train_tb, "Train TB"),
        (test_normal, "Test Normal"),
        (test_tb, "Test TB"),
    ]:
        if not os.path.exists(path):
            print(f"❌ {name} directory not found: {path}")
            return
        count = len(
            [
                f
                for f in os.listdir(path)
                if f.lower().endswith((".jpg", ".png", ".jpeg"))
            ]
        )
        print(f"✅ {name}: {count} images")

    print("\n🚀 Starting model training...")
    print("This may take several minutes depending on your hardware...")

    # Run training by executing the training script directly
    try:
        # Use subprocess to run the training script
        import subprocess
        result = subprocess.run([sys.executable, "app/scripts/train_tb_model.py"],
                              capture_output=False, text=True)

        if result.returncode == 0:
            print("\n✅ Training completed successfully!")
            print("Check the training_curves.png file for training progress visualization.")
        else:
            print(f"\n❌ Training failed with return code: {result.returncode}")

    except Exception as e:
        print(f"❌ Training failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
