# 🗄️ TBNow SQLite Database Setup

Panduan lengkap menggunakan SQLite sebagai database untuk menyimpan rekam medis pasien.

## 📋 Keunggulan SQLite

- ✅ **File-based**: Tidak perlu hosting server database terpisah
- ✅ **Portable**: Database disimpan dalam file `data/tbnow.db`
- ✅ **Reliable**: ACID compliance, transaksi aman
- ✅ **Fast**: Query cepat untuk data terstruktur
- ✅ **Backup mudah**: Cukup copy file database

## 🏗️ Struktur Database

### Tabel: `patient_records`

```sql
CREATE TABLE patient_records (
    id TEXT PRIMARY KEY,           -- UUID unik untuk setiap record
    patient_id TEXT UNIQUE,        -- ID pasien (TB-2025-001, dll)
    date TEXT,                     -- Tanggal record (YYYY-MM-DD)
    type TEXT,                     -- Tipe record (Patient Diagnosis)
    status TEXT,                   -- Status (completed, follow-up, treatment, normal, pending)
    result TEXT,                   -- Hasil diagnosis/assessment
    patient_info TEXT,             -- JSON: info pasien (nama, umur, dll)
    xray_result TEXT,              -- JSON: hasil analisis X-ray (nullable)
    chat_history TEXT,             -- JSON: history chat dengan AI
    created_at TEXT,               -- Timestamp dibuat (ISO format)
    updated_at TEXT                -- Timestamp diupdate (ISO format)
);
```

### Indexes untuk Performance

```sql
CREATE INDEX idx_patient_id ON patient_records(patient_id);
CREATE INDEX idx_status ON patient_records(status);
CREATE INDEX idx_date ON patient_records(date);
```

## 🚀 Migrasi dari JSON ke SQLite

### Langkah Otomatis
```bash
cd tbnow-back
python migrate_to_sqlite.py
```

### Yang Terjadi:
1. ✅ Membaca data dari `patient_records.json`
2. ✅ Membuat tabel SQLite dengan schema yang tepat
3. ✅ Migrasi semua records dengan data lengkap
4. ✅ Backup file JSON asli ke `patient_records.json.backup`
5. ✅ Verifikasi integritas data

## 📊 Operasi Database

### Melihat Isi Database
```bash
# Menggunakan Python
python -c "
import sqlite3
conn = sqlite3.connect('data/tbnow.db')
cursor = conn.execute('SELECT patient_id, status, date FROM patient_records')
for row in cursor.fetchall():
    print(row)
conn.close()
"
```

### Backup Database
```bash
# Copy file database
cp data/tbnow.db data/tbnow_backup.db

# Atau dengan timestamp
cp data/tbnow.db "data/tbnow_$(date +%Y%m%d_%H%M%S).db"
```

### Restore dari Backup
```bash
cp data/tbnow_backup.db data/tbnow.db
```

## 🔧 Maintenance Database

### Mengecek Ukuran Database
```bash
ls -lh data/tbnow.db
```

### Vacuum Database (Optimize Space)
```python
import sqlite3
conn = sqlite3.connect('data/tbnow.db')
conn.execute('VACUUM')
conn.close()
```

### Mengecek Integrity
```python
import sqlite3
conn = sqlite3.connect('data/tbnow.db')
cursor = conn.execute('PRAGMA integrity_check')
result = cursor.fetchone()
print(f"Integrity check: {result[0]}")
conn.close()
```

## 📈 Monitoring & Analytics

### Query untuk Dashboard
```python
import sqlite3
import json
from datetime import datetime, timedelta

conn = sqlite3.connect('data/tbnow.db')

# Total records
cursor = conn.execute('SELECT COUNT(*) FROM patient_records')
total_records = cursor.fetchone()[0]

# Records by status
cursor = conn.execute('SELECT status, COUNT(*) FROM patient_records GROUP BY status')
status_counts = dict(cursor.fetchall())

# Recent records (last 7 days)
week_ago = (datetime.now() - timedelta(days=7)).isoformat()
cursor = conn.execute('SELECT COUNT(*) FROM patient_records WHERE created_at > ?', (week_ago,))
recent_records = cursor.fetchone()[0]

print(f"Total Records: {total_records}")
print(f"Status Distribution: {status_counts}")
print(f"Recent Records (7 days): {recent_records}")

conn.close()
```

## 🔒 Keamanan Database

### File Permissions
```bash
# Pastikan hanya owner yang bisa akses
chmod 600 data/tbnow.db
```

### Environment Variables
```bash
# Jangan commit database ke Git
echo "data/tbnow.db" >> .gitignore
echo "data/*.db" >> .gitignore
```

## 🚨 Troubleshooting

### Database Corrupt
```bash
# Restore dari backup
cp data/tbnow_backup.db data/tbnow.db

# Atau recreate dari JSON backup
python migrate_to_sqlite.py
```

### Performance Lambat
```bash
# Tambah indexes jika perlu
sqlite3 data/tbnow.db "CREATE INDEX idx_created_at ON patient_records(created_at);"
```

### Memory Issues
- SQLite menggunakan memory efficient storage
- Untuk dataset besar, consider pagination di API

## 🔄 Upgrade Database Schema

Jika perlu menambah kolom baru:

```python
import sqlite3

conn = sqlite3.connect('data/tbnow.db')

# Contoh: tambah kolom notes
conn.execute('ALTER TABLE patient_records ADD COLUMN notes TEXT')

# Update existing records
conn.execute('UPDATE patient_records SET notes = "" WHERE notes IS NULL')

conn.commit()
conn.close()
```

## 📚 Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Python Tutorial](https://docs.python.org/3/library/sqlite3.html)
- [Database Design Best Practices](https://www.sqlite.org/appfileformat.html)

---

**🎉 Selamat! Sekarang TBNow menggunakan database SQLite yang robust dan scalable!**