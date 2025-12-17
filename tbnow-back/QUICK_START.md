# 🚀 Panduan Cepat Training Model TBNow

## Persiapan
Pastikan Anda berada di folder `tbnow-back/`:
```bash
cd tbnow-back
```

## Langkah Training

### 1. Test Setup (Rekomendasi)
```bash
python test_setup.py
```
Ini akan memverifikasi bahwa semua komponen siap untuk training.

### 2. Mulai Training
```bash
python train_model.py
```

### 3. Monitor Progress
Training akan menampilkan:
- Progress per epoch
- Training loss dan accuracy
- Validation accuracy
- Waktu per epoch

### 4. Output
Setelah training selesai, Anda akan mendapat:
- Model terbaik tersimpan di `app/xray/model_tb.pth`
- Grafik training di `training_curves.png`
- Laporan klasifikasi dan confusion matrix

## ⚙️ Konfigurasi Cepat

### Untuk Hardware Terbatas
Edit `app/scripts/train_tb_model.py`:
```python
batch_size = 8  # Kurangi dari 16
num_epochs = 10  # Kurangi dari 20
```

### Untuk GPU (Jika Punya)
Training akan otomatis menggunakan GPU jika tersedia.

## ⏱️ Estimasi Waktu

- **CPU**: ~5-10 menit per epoch
- **GPU**: ~1-2 menit per epoch
- **Total**: ~20-60 menit tergantung hardware

## 🛑 Jika Bermasalah

### Memory Error
- Kurangi `batch_size` menjadi 4 atau 8
- Restart Python session

### Slow Training
- Gunakan GPU jika tersedia
- Kurangi jumlah epochs

### Data Error
- Pastikan folder `data/xray/train/` dan `data/xray/test/` ada
- Pastikan gambar dalam format JPG/PNG

## 📊 Mengecek Hasil

Setelah training, model akan otomatis menggantikan model lama. Test dengan:
```bash
python test_xray_model.py
```

---

**Happy Training! 🎉**