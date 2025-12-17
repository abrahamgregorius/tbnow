# backend/app/main.py
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF warnings

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
from app.xray.inference import quick_screen

app = FastAPI(title="TBNow API")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Records storage
RECORDS_FILE = "data/patient_records.json"

def load_records():
    if os.path.exists(RECORDS_FILE):
        with open(RECORDS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_records(records):
    os.makedirs("data", exist_ok=True)
    with open(RECORDS_FILE, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

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
    records = load_records()
    return {"records": records}

@app.post("/records")
async def create_record(request: DiagnosisRequest):
    records = load_records()
    
    # Generate patient ID
    patient_id = f"TB-{datetime.now().year}-{str(len(records) + 1).zfill(3)}"
    
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
    
    records.append(record)
    save_records(records)
    
    return {"record": record, "message": "Record created successfully"}

@app.get("/records/{record_id}")
async def get_record(record_id: str):
    records = load_records()
    record = next((r for r in records if r["id"] == record_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@app.post("/records/{record_id}/chat")
async def add_chat_to_record(record_id: str, request: QueryRequest):
    records = load_records()
    record = next((r for r in records if r["id"] == record_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
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
    
    if "chatHistory" not in record:
        record["chatHistory"] = []
    
    record["chatHistory"].append(chat_entry)
    record["updatedAt"] = datetime.now().isoformat()
    
    save_records(records)
    
    return {"chat": chat_entry, "record": record}

@app.put("/records/{record_id}")
async def update_record(record_id: str, update: RecordUpdate):
    records = load_records()
    record = next((r for r in records if r["id"] == record_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    record["status"] = update.status
    if update.notes:
        record["notes"] = update.notes
    record["updatedAt"] = datetime.now().isoformat()
    
    save_records(records)
    
    return {"record": record, "message": "Record updated successfully"}

@app.delete("/records/{record_id}")
async def delete_record(record_id: str):
    records = load_records()
    record = next((r for r in records if r["id"] == record_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    records = [r for r in records if r["id"] != record_id]
    save_records(records)
    
    return {"message": "Record deleted successfully"}
