#!/usr/bin/env python3
"""
Migrate existing JSON records to SQLite database
"""

import json
import sqlite3
import os
from contextlib import contextmanager

# Database setup
DATABASE_PATH = "data/tbnow.db"
JSON_FILE = "data/patient_records.json"

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_database():
    """Initialize database tables"""
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS patient_records (
                id TEXT PRIMARY KEY,
                patient_id TEXT UNIQUE,
                date TEXT,
                type TEXT,
                status TEXT,
                result TEXT,
                patient_info TEXT,
                xray_result TEXT,
                chat_history TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        ''')

        conn.execute('CREATE INDEX IF NOT EXISTS idx_patient_id ON patient_records(patient_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_status ON patient_records(status)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_date ON patient_records(date)')

        conn.commit()

# Database setup
DATABASE_PATH = "data/tbnow.db"
JSON_FILE = "data/patient_records.json"
BACKUP_FILE = "data/patient_records.json.backup"

def migrate_json_to_sqlite():
    """Migrate data from JSON file to SQLite database"""
    # Try to find the JSON file (could be original or backup)
    json_file_path = None
    if os.path.exists(JSON_FILE):
        json_file_path = JSON_FILE
    elif os.path.exists(BACKUP_FILE):
        json_file_path = BACKUP_FILE
        print(f"📄 Using backup file: {BACKUP_FILE}")
    
    if not json_file_path:
        print(f"❌ No JSON file found: {JSON_FILE} or {BACKUP_FILE}")
        return False

    # Load JSON data
    with open(json_file_path, 'r', encoding='utf-8') as f:
        records = json.load(f)

    if not records:
        print("ℹ️  No records to migrate")
        return True

    print(f"📊 Found {len(records)} records to migrate")

    # Initialize database
    init_database()

    # Insert records into database
    with get_db() as conn:
        migrated_count = 0
        skipped_count = 0

        for record in records:
            try:
                # Check if record already exists
                cursor = conn.execute('SELECT id FROM patient_records WHERE id = ?', (record['id'],))
                if cursor.fetchone():
                    print(f"⏭️  Skipping existing record: {record['patientId']}")
                    skipped_count += 1
                    continue

                # Insert new record
                conn.execute('''
                    INSERT INTO patient_records
                    (id, patient_id, date, type, status, result, patient_info, xray_result, chat_history, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    record['id'],
                    record['patientId'],
                    record['date'],
                    record['type'],
                    record['status'],
                    record['result'],
                    json.dumps(record['patientInfo']),
                    json.dumps(record['xrayResult']) if record.get('xrayResult') else None,
                    json.dumps(record.get('chatHistory', [])),
                    record['createdAt'],
                    record['updatedAt']
                ))

                migrated_count += 1
                print(f"✅ Migrated record: {record['patientId']}")

            except Exception as e:
                print(f"❌ Error migrating record {record.get('patientId', 'unknown')}: {e}")
                continue

        conn.commit()
        print(f"\n📈 Migration Summary:")
        print(f"   ✅ Migrated: {migrated_count} records")
        print(f"   ⏭️  Skipped: {skipped_count} records")
        print(f"   📊 Total: {len(records)} records")

    return True

def verify_migration():
    """Verify that migration was successful"""
    print("\n🔍 Verifying migration...")

    with get_db() as conn:
        cursor = conn.execute('SELECT COUNT(*) as count FROM patient_records')
        db_count = cursor.fetchone()['count']

    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            json_records = json.load(f)
        json_count = len(json_records)
    else:
        json_count = 0

    print(f"   📄 JSON records: {json_count}")
    print(f"   🗄️  SQLite records: {db_count}")

    if db_count >= json_count:
        print("✅ Migration successful!")
        return True
    else:
        print("❌ Migration incomplete!")
        return False

def main():
    print("🔄 TBNow Database Migration")
    print("=" * 40)
    print("Migrating from JSON to SQLite database...")

    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)

    # Perform migration
    if migrate_json_to_sqlite():
        if verify_migration():
            print("\n🎉 Migration completed successfully!")
            print("You can now use SQLite database instead of JSON files.")
            print("\nNext steps:")
            print("1. Test the application to ensure records work correctly")
            print("2. Backup the old JSON file if needed")
            print("3. The app will now use SQLite automatically")
        else:
            print("\n❌ Migration verification failed!")
    else:
        print("\n❌ Migration failed!")

if __name__ == "__main__":
    main()