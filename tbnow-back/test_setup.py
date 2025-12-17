#!/usr/bin/env python3
"""
Quick test script for TBNow model training setup
"""

import os
import torch
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split

def test_setup():
    print("🔍 Testing TBNow Training Setup")
    print("=" * 40)

    # Test data directory
    data_dir = "data/xray"
    if not os.path.exists(data_dir):
        print("❌ Data directory not found")
        return False

    print("✅ Data directory found")

    # Test data loading
    try:
        train_transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])

        train_dataset = datasets.ImageFolder(
            os.path.join(data_dir, "train"), transform=train_transforms
        )
        test_dataset = datasets.ImageFolder(
            os.path.join(data_dir, "test"), transform=train_transforms
        )

        train_size = int(0.8 * len(train_dataset))
        val_size = len(train_dataset) - train_size
        train_dataset, val_dataset = random_split(train_dataset, [train_size, val_size])

        print(f"✅ Data loaded: Train {len(train_dataset)}, Val {len(val_dataset)}, Test {len(test_dataset)}")

    except Exception as e:
        print(f"❌ Data loading failed: {e}")
        return False

    # Test model creation
    try:
        try:
            model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            print("✅ Model created with new torchvision API")
        except AttributeError:
            model = models.resnet18(pretrained=True)
            print("✅ Model created with legacy API")
    except Exception as e:
        print(f"❌ Model creation failed: {e}")
        return False

    # Test scheduler
    try:
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            torch.optim.Adam([torch.nn.Linear(1, 1).parameters()]),
            mode='max', factor=0.5, patience=3
        )
        print("✅ Learning rate scheduler created")
    except Exception as e:
        print(f"❌ Scheduler creation failed: {e}")
        return False

    # Test device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"✅ Using device: {device}")

    print("\n🎉 All components working! Ready to train.")
    print("\nTo start training, run:")
    print("python train_model.py")
    return True

if __name__ == "__main__":
    test_setup()