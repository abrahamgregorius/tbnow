import faiss
import pickle
import os

from sentence_transformers import SentenceTransformer
from google import genai

from .prompt import SYSTEM_PROMPT
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Load embedding model
MODEL = SentenceTransformer("all-MiniLM-L6-v2")

# Global variables for FAISS and chunks
index = None
chunks = None

def load_rag_data():
    global index, chunks
    if index is None and os.path.exists("data/faiss.index"):
        index = faiss.read_index("data/faiss.index")
    if chunks is None and os.path.exists("data/chunks.pkl"):
        with open("data/chunks.pkl", "rb") as f:
            chunks = pickle.load(f)

# Load data on import
load_rag_data()

def rag_answer(question: str, query_type: str = "quick"):
    # Check if data files exist
    if not os.path.exists("data/faiss.index") or not os.path.exists("data/chunks.pkl"):
        return {
            "answer": "Data belum diingest. Silakan jalankan script ingestion setelah menambahkan file PDF ke folder data/guidelines/.",
            "sources": [],
            "disclaimer": "Bukan diagnosis medis"
        }

    # Ensure data is loaded
    if index is None or chunks is None:
        load_rag_data()

    # Format question based on type
    if query_type == "diagnosis":
        formatted_question = f"""
PERMINTAAN BANTUAN DIAGNOSIS PASIEN:

{question}

Berikan dukungan pengambilan keputusan klinis untuk screening TB berdasarkan informasi pasien di atas.
Sertakan penilaian risiko, tes diagnostik yang direkomendasikan, dan pertimbangan klinis.
"""
    else:  # quick guidance
        formatted_question = f"Pertanyaan bimbingan klinis cepat: {question}"

    # Embed user question
    q_embed = MODEL.encode([formatted_question])
    _, I = index.search(q_embed, 5)

    # Build context
    context = "\n".join([chunks[i] for i in I[0]])

    # Call Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""
{SYSTEM_PROMPT}

Context:
{context}

Question:
{formatted_question}
"""
    )

    return {
        "answer": response.text,
        "sources": ["Pedoman TB WHO / SOP Kemenkes"],
        "disclaimer": "Bukan diagnosis medis"
    }
