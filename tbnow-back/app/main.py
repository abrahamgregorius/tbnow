# backend/app/main.py
import os
# Set environment variables BEFORE any other imports
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # More aggressive TF suppression
os.environ['TF_CPP_MIN_VLOG_LEVEL'] = '3'

# Suppress all warnings immediately
import warnings
warnings.filterwarnings('ignore')
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=RuntimeWarning)

# Suppress TensorFlow/Keras warnings specifically
warnings.filterwarnings('ignore', module='tensorflow')
warnings.filterwarnings('ignore', module='tf_keras')
warnings.filterwarnings('ignore', module='keras')

# Set TensorFlow logging to ERROR only
import logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)
logging.getLogger('tf_keras').setLevel(logging.ERROR)

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from app.rag.query import rag_answer
from PIL import Image
import io
import json
import os
from datetime import datetime
import uuid
import sqlite3
from contextlib import contextmanager
from app.xray.inference import quick_screen

app = FastAPI(title="TBNow API")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Database setup
DATABASE_PATH = "data/tbnow.db"

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    try:
        yield conn
    finally:
        conn.close()

def init_database():
    """Initialize database tables"""
    with get_db() as conn:
        # Create patient_records table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS patient_records (
                id TEXT PRIMARY KEY,
                patient_id TEXT UNIQUE,
                date TEXT,
                type TEXT,
                status TEXT,
                result TEXT,
                patient_info TEXT,  -- JSON string
                xray_result TEXT,   -- JSON string
                chat_history TEXT,  -- JSON string
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # Create indexes for better performance
        conn.execute('CREATE INDEX IF NOT EXISTS idx_patient_id ON patient_records(patient_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_status ON patient_records(status)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_date ON patient_records(date)')
        
        conn.commit()

# Initialize database on startup
init_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str
    query_type: str = "quick"

class PatientInfo(BaseModel):
    name: str = ""
    age: str = ""
    gender: str = ""
    symptoms: str = ""
    duration: str = ""
    contactHistory: str = ""
    comorbidities: str = ""
    vitalSigns: str = ""
    physicalExam: str = ""

class DiagnosisRequest(BaseModel):
    patientInfo: PatientInfo
    assessment: str
    xrayResult: dict = None

class RecordUpdate(BaseModel):
    status: str
    notes: str = ""


@app.post("/rag/query")
async def rag_query(request: QueryRequest):
    query_type = getattr(request, 'query_type', 'quick')
    return rag_answer(request.question, query_type)


@app.post("/xray/analyze")
async def analyze_xray(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read()))
    return quick_screen(image)

# Records endpoints
@app.get("/records")
async def get_records():
    with get_db() as conn:
        cursor = conn.execute('''
            SELECT * FROM patient_records 
            ORDER BY created_at DESC
        ''')
        records = []
        for row in cursor.fetchall():
            record = dict(row)
            # Parse JSON fields
            record['patientInfo'] = json.loads(record['patient_info']) if record['patient_info'] else {}
            record['xrayResult'] = json.loads(record['xray_result']) if record['xray_result'] else None
            record['chatHistory'] = json.loads(record['chat_history']) if record['chat_history'] else []
            # Remove old field names
            del record['patient_info']
            del record['xray_result'] 
            del record['chat_history']
            records.append(record)
        return {"records": records}

@app.post("/records")
async def create_record(request: DiagnosisRequest):
    # Generate patient ID
    patient_id = f"TB-{datetime.now().year}-{str(len(get_records()['records']) + 1).zfill(3)}"
    
    # Determine status based on assessment
    assessment_lower = request.assessment.lower()
    if "tinggi" in assessment_lower or "high" in assessment_lower:
        status = "follow-up"
    elif "rendah" in assessment_lower or "low" in assessment_lower:
        status = "normal"
    elif "konfirmasi" in assessment_lower or "confirmed" in assessment_lower:
        status = "treatment"
    else:
        status = "completed"
    
    record = {
        "id": str(uuid.uuid4()),
        "patientId": patient_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "type": "Patient Diagnosis",
        "status": status,
        "result": request.assessment,
        "patientInfo": request.patientInfo.dict(),
        "xrayResult": request.xrayResult,
        "chatHistory": [],
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    # Insert into database
    with get_db() as conn:
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
            json.dumps(record['xrayResult']) if record['xrayResult'] else None,
            json.dumps(record['chatHistory']),
            record['createdAt'],
            record['updatedAt']
        ))
        conn.commit()
    
    return {"record": record, "message": "Record created successfully"}

@app.get("/records/{record_id}")
async def get_record(record_id: str):
    with get_db() as conn:
        cursor = conn.execute('SELECT * FROM patient_records WHERE id = ?', (record_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Record not found")
        
        record = dict(row)
        # Parse JSON fields
        record['patientInfo'] = json.loads(record['patient_info']) if record['patient_info'] else {}
        record['xrayResult'] = json.loads(record['xray_result']) if record['xray_result'] else None
        record['chatHistory'] = json.loads(record['chat_history']) if record['chat_history'] else []
        # Remove old field names
        del record['patient_info']
        del record['xray_result'] 
        del record['chat_history']
        return record

@app.post("/records/{record_id}/chat")
async def add_chat_to_record(record_id: str, request: QueryRequest):
    # Get current record
    record = await get_record(record_id)
    
    # Get AI response using record-specific RAG
    from .rag.query import record_rag_answer
    response = record_rag_answer(request.question, record, request.query_type)
    
    # Add to chat history
    chat_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "question": request.question,
        "response": response["answer"],
        "queryType": request.query_type
    }
    
    chat_history = record.get("chatHistory", [])
    chat_history.append(chat_entry)
    
    # Update record in database
    with get_db() as conn:
        conn.execute('''
            UPDATE patient_records 
            SET chat_history = ?, updated_at = ?
            WHERE id = ?
        ''', (
            json.dumps(chat_history),
            datetime.now().isoformat(),
            record_id
        ))
        conn.commit()
    
    # Return updated record
    updated_record = await get_record(record_id)
    
    return {"chat": chat_entry, "record": updated_record}

@app.put("/records/{record_id}")
async def update_record(record_id: str, update: RecordUpdate):
    # Check if record exists
    await get_record(record_id)
    
    # Update record in database
    with get_db() as conn:
        conn.execute('''
            UPDATE patient_records 
            SET status = ?, updated_at = ?
            WHERE id = ?
        ''', (
            update.status,
            datetime.now().isoformat(),
            record_id
        ))
        conn.commit()
    
    # Return updated record
    updated_record = await get_record(record_id)
    
    return {"record": updated_record, "message": "Record updated successfully"}

@app.delete("/records/{record_id}")
async def delete_record(record_id: str):
    # Check if record exists
    await get_record(record_id)
    
    # Delete record from database
    with get_db() as conn:
        conn.execute('DELETE FROM patient_records WHERE id = ?', (record_id,))
        conn.commit()
    
    return {"message": "Record deleted successfully"}
