# backend/app/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.rag.query import rag_answer

app = FastAPI(title="TBNow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

@app.post("/rag/query")
async def rag_query(request: QueryRequest):
    return rag_answer(request.question)

@app.post("/xray/analyze")
async def xray_analyze(file: UploadFile = File(...)):
    return {
        "risk_level": "Medium",
        "confidence": 0.75,
        "note": "Not a diagnosis"
    }
