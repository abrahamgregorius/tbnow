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

# # Load FAISS index & chunks
# index = faiss.read_index("data/faiss.index")
# with open("data/chunks.pkl", "rb") as f:
#     chunks = pickle.load(f)


def rag_answer(question: str):
    # Check if data files exist
    if not os.path.exists("data/faiss.index") or not os.path.exists("data/chunks.pkl"):
        return {
            "answer": "Data not ingested yet. Please run the ingestion script after adding PDF files to data/guidelines/.",
            "sources": [],
            "disclaimer": "Not a medical diagnosis"
        }

    # Load FAISS index & chunks
    index = faiss.read_index("data/faiss.index")
    with open("data/chunks.pkl", "rb") as f:
        chunks = pickle.load(f)

    # Embed user question
    q_embed = MODEL.encode([question])
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
{question}
"""
    )

    return {
        "answer": response.text,
        "sources": ["WHO TB Guideline / Kemenkes SOP"],
        "disclaimer": "Not a medical diagnosis"
    }
