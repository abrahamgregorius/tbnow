import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import time

# Config
data_dir = "data/xray"  # Folder berisi train/ dan test/
num_classes = 2  # Normal vs TB
batch_size = 16
num_epochs = 20  # Increased epochs
learning_rate = 1e-4
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_save_path = "app/xray/model_tb.pth"

print(f"Using device: {device}")
print(f"Training data directory: {data_dir}")

# Enhanced data transforms with more augmentation
train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(15),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

val_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# Load datasets
print("Loading datasets...")
train_dataset = datasets.ImageFolder(
    os.path.join(data_dir, "train"), transform=train_transforms
)
test_dataset = datasets.ImageFolder(
    os.path.join(data_dir, "test"), transform=val_transforms
)

# Create validation split from training data (80% train, 20% val)
train_size = int(0.8 * len(train_dataset))
val_size = len(train_dataset) - train_size
train_dataset, val_dataset = random_split(train_dataset, [train_size, val_size])

# Apply validation transforms to val_dataset
val_dataset.dataset.transform = val_transforms

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

print(f"Train samples: {len(train_dataset)}")
print(f"Validation samples: {len(val_dataset)}")
print(f"Test samples: {len(test_dataset)}")

# Model with fine-tuning
try:
    # Try new torchvision API first
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
except AttributeError:
    # Fallback to old API
    model = models.resnet18(pretrained=True)

# Freeze early layers, fine-tune later layers
for param in model.parameters():
    param.requires_grad = False

# Unfreeze the last few layers
for param in model.layer4.parameters():
    param.requires_grad = True

# Replace classifier
model.fc = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(model.fc.in_features, num_classes)
)
model = model.to(device)

# Loss & optimizer (only optimize unfrozen parameters)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam([
    {'params': model.layer4.parameters()},
    {'params': model.fc.parameters()}
], lr=learning_rate)

# Learning rate scheduler
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=3)

# Training tracking
train_losses = []
val_accuracies = []
best_val_acc = 0.0
patience = 7
patience_counter = 0

print("Starting training...")
start_time = time.time()

for epoch in range(num_epochs):
    epoch_start = time.time()

    # Training phase
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    train_loss = running_loss / len(train_dataset)
    train_acc = correct / total

    # Validation phase
    model.eval()
    val_correct = 0
    val_total = 0
    val_loss = 0.0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            val_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            val_total += labels.size(0)
            val_correct += predicted.eq(labels).sum().item()

    val_acc = val_correct / val_total
    val_loss = val_loss / len(val_dataset)

    epoch_time = time.time() - epoch_start

    print(f"Epoch [{epoch+1}/{num_epochs}] ({epoch_time:.1f}s)")
    print(".4f")
    print(".4f")

    # Track metrics
    train_losses.append(train_loss)
    val_accuracies.append(val_acc)

    # Learning rate scheduling
    scheduler.step(val_acc)

    # Save best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'val_acc': val_acc,
            'train_loss': train_loss
        }, model_save_path)
        print(".4f")
        patience_counter = 0
    else:
        patience_counter += 1

    # Early stopping
    if patience_counter >= patience:
        print(f"Early stopping at epoch {epoch+1}")
        break

total_time = time.time() - start_time
print(".1f")

# Load best model for testing
checkpoint = torch.load(model_save_path)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

# Test on test set
test_correct = 0
test_total = 0
all_preds = []
all_labels = []

with torch.no_grad():
    for images, labels in test_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        _, predicted = outputs.max(1)
        test_total += labels.size(0)
        test_correct += predicted.eq(labels).sum().item()

        all_preds.extend(predicted.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

test_acc = test_correct / test_total
print(".4f")

# Classification report
print("\nClassification Report:")
print(classification_report(all_labels, all_preds, target_names=['Normal', 'TB']))

# Confusion matrix
cm = confusion_matrix(all_labels, all_preds)
print("\nConfusion Matrix:")
print("Predicted -> Normal    TB")
print(f"Actual Normal: {cm[0][0]:3d}    {cm[0][1]:3d}")
print(f"Actual TB:     {cm[1][0]:3d}    {cm[1][1]:3d}")

# Plot training curves
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(train_losses, label='Training Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training Loss')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(val_accuracies, label='Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.title('Validation Accuracy')
plt.legend()

plt.tight_layout()
plt.savefig('training_curves.png', dpi=150, bbox_inches='tight')
print("Training curves saved as 'training_curves.png'")

print("\n🎉 Training completed successfully!")
print(f"Best validation accuracy: {best_val_acc:.4f}")
print(f"Test accuracy: {test_acc:.4f}")
print(f"Model saved to: {model_save_path}")
