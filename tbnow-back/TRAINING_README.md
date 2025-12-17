# TBNow Model Training Guide

Panduan lengkap untuk melatih ulang model deteksi TB pada X-ray dengan data terbaru.

## 📋 Persiapan Data

### Struktur Folder Data
```
data/xray/
├── train/
│   ├── Normal/     # X-ray normal (tanpa TB)
│   └── TB/         # X-ray dengan TB
└── test/
    ├── Normal/     # Data test normal
    └── TB/         # Data test TB
```

### Jumlah Data Saat Ini
- **Train Normal**: 293 gambar
- **Train TB**: 815 gambar
- **Test Normal**: 116 gambar
- **Test TB**: 48 gambar
- **Total**: 1,272 gambar

## 🚀 Cara Melatih Model

### 1. Test Setup (Opsional)
```bash
python test_setup.py
```

### 2. Jalankan Training
```bash
# Dari folder tbnow-back/
python train_model.py
```

Atau jalankan script training langsung:
```bash
python app/scripts/train_tb_model.py
```

## ⚙️ Konfigurasi Training

### Parameter Utama
- **Model**: ResNet18 (pre-trained)
- **Batch Size**: 16
- **Epochs**: 20 (dengan early stopping)
- **Learning Rate**: 1e-4 (dengan scheduler)
- **Fine-tuning**: Hanya layer terakhir yang dilatih ulang

### Augmentasi Data
- Random horizontal flip
- Random rotation (±15°)
- Random translation
- Color jittering
- Normalization (ImageNet stats)

## 📊 Output Training

### File yang Dihasilkan
1. **`app/xray/model_tb.pth`** - Model terbaik berdasarkan validation accuracy
2. **`training_curves.png`** - Grafik loss dan accuracy selama training

### Metrics yang Ditampilkan
- Training loss dan accuracy per epoch
- Validation accuracy
- Test accuracy akhir
- Classification report (precision, recall, F1-score)
- Confusion matrix

## 🔧 Advanced Configuration

### Mengubah Hyperparameters
Edit file `app/scripts/train_tb_model.py`:

```python
# Ubah parameter training
batch_size = 32          # Lebih besar untuk GPU yang kuat
num_epochs = 50          # Lebih banyak epoch
learning_rate = 5e-5     # Learning rate lebih kecil
```

### Menggunakan GPU
Jika punya GPU NVIDIA dengan CUDA:
```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
```

### Menambah Augmentasi
Tambahkan transform di `train_transforms`:
```python
transforms.RandomVerticalFlip(p=0.2),
transforms.GaussianBlur(kernel_size=3),
```

## 📈 Monitoring Training

### Early Stopping
Training akan berhenti otomatis jika:
- Validation accuracy tidak meningkat selama 7 epoch
- Atau mencapai epoch maksimal (20)

### Learning Rate Scheduling
Learning rate akan dikurangi 50% jika validation accuracy tidak meningkat selama 3 epoch.

## 🎯 Tips untuk Hasil Terbaik

### 1. Data Quality
- Pastikan gambar X-ray berkualitas baik
- Label yang akurat (Normal vs TB)
- Variasi sudut dan pencahayaan

### 2. Data Balance
- Pastikan jumlah data Normal dan TB seimbang
- Jika imbalance, gunakan weighted loss atau oversampling

### 3. Hardware
- GPU disarankan untuk training lebih cepat
- Minimal 8GB RAM untuk batch processing

### 4. Validation
- Selalu pisahkan data test dari training
- Monitor validation accuracy, bukan training accuracy
- Gunakan test set hanya untuk evaluasi akhir

## 🔍 Troubleshooting

### Memory Error
- Kurangi `batch_size` menjadi 8 atau 4
- Pastikan GPU memory cukup

### Low Accuracy
- Tambah data training
- Coba learning rate yang berbeda
- Periksa kualitas data

### CUDA Error
- Pastikan PyTorch CUDA version sesuai dengan driver GPU
- Gunakan CPU jika GPU bermasalah: `device = torch.device("cpu")`

## 📝 Catatan

- Model akan otomatis menyimpan checkpoint terbaik
- Training curves akan membantu debug jika ada masalah
- Untuk deployment, gunakan model dari `app/xray/model_tb.pth`