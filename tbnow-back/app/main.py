# backend/app/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from app.rag.query import rag_answer
from PIL import Image
import io
from app.xray.inference import quick_screen

app = FastAPI(title="TBNow API")
app.mount("/static", StaticFiles(directory="static"), name="static")

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
async def analyze_xray(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read()))
    return quick_screen(image)
