#!/usr/bin/env python3
"""
Test script for SQLite database functionality
"""

import sqlite3
import json
from contextlib import contextmanager

@contextmanager
def get_db():
    conn = sqlite3.connect('data/tbnow.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def test_database():
    print("🧪 Testing SQLite Database Functionality")
    print("=" * 50)

    try:
        with get_db() as conn:
            # Test 1: Count records
            cursor = conn.execute('SELECT COUNT(*) as count FROM patient_records')
            count = cursor.fetchone()['count']
            print(f"✅ Database connection: OK")
            print(f"✅ Records count: {count}")

            # Test 2: Fetch sample record
            cursor = conn.execute('SELECT * FROM patient_records LIMIT 1')
            row = cursor.fetchone()
            if row:
                record = dict(row)
                print(f"✅ Sample record: {record['patient_id']} ({record['status']})")

                # Parse JSON fields
                patient_info = json.loads(record['patient_info'])
                print(f"✅ Patient info parsing: OK ({patient_info.get('name', 'No name')})")

                if record['xray_result']:
                    xray_result = json.loads(record['xray_result'])
                    print(f"✅ X-ray result parsing: OK ({xray_result.get('risk_level', 'No risk')})")

                chat_history = json.loads(record['chat_history']) if record['chat_history'] else []
                print(f"✅ Chat history parsing: OK ({len(chat_history)} messages)")

            # Test 3: Status distribution
            cursor = conn.execute('SELECT status, COUNT(*) as count FROM patient_records GROUP BY status')
            status_dist = dict(cursor.fetchall())
            print(f"✅ Status distribution: {status_dist}")

            # Test 4: Recent records
            cursor = conn.execute('SELECT COUNT(*) as count FROM patient_records WHERE date >= date("now", "-7 days")')
            recent_count = cursor.fetchone()['count']
            print(f"✅ Recent records (7 days): {recent_count}")

        print("\n🎉 All database tests passed!")
        return True

    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoints():
    """Test API endpoints if server is running"""
    print("\n🌐 Testing API Endpoints")
    print("-" * 30)

    try:
        import requests

        # Test records endpoint
        response = requests.get('http://localhost:8000/records', timeout=5)
        if response.status_code == 200:
            data = response.json()
            api_count = len(data.get('records', []))
            print(f"✅ API /records: OK ({api_count} records)")

            if api_count > 0:
                # Test individual record
                record_id = data['records'][0]['id']
                response2 = requests.get(f'http://localhost:8000/records/{record_id}', timeout=5)
                if response2.status_code == 200:
                    print("✅ API /records/{id}: OK")
                else:
                    print(f"❌ API /records/{{id}}: Failed ({response2.status_code})")
        else:
            print(f"❌ API /records: Failed ({response.status_code})")

    except requests.exceptions.RequestException:
        print("⚠️  API not available (server not running)")
    except ImportError:
        print("⚠️  Requests library not available")

if __name__ == "__main__":
    success = test_database()
    test_api_endpoints()

    if success:
        print("\n✅ SQLite database is working perfectly!")
        print("TBNow now uses a robust, file-based database system.")
    else:
        print("\n❌ Database issues detected. Check SQLITE_README.md for troubleshooting.")