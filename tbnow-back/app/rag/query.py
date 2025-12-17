import faiss
import pickle
import os
import time

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

def call_gemini_with_retry(contents: str, max_retries: int = 2, retry_delay: float = 3.0):
    """
    Call Gemini API with retry logic for temporary failures
    """
    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=contents
            )
            return response
        except Exception as e:
            error_message = str(e)
            
            # Don't retry for permanent errors
            if "400" in error_message or "401" in error_message or "403" in error_message:
                raise e
            
            # Retry for temporary errors
            if attempt < max_retries and ("503" in error_message or "UNAVAILABLE" in error_message or "overloaded" in error_message.lower()):
                print(f"Gemini API temporarily unavailable (attempt {attempt + 1}/{max_retries + 1}), retrying in {retry_delay}s...")
                time.sleep(retry_delay)
                retry_delay *= 1.5  # Exponential backoff
                continue
            
            # If we've exhausted retries or it's not a retryable error
            raise e

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
    try:
        response = call_gemini_with_retry(f"""
{SYSTEM_PROMPT}

Context:
{context}

Question:
{formatted_question}
""")
        return {
            "answer": response.text,
            "sources": ["Pedoman TB WHO / SOP Kemenkes"],
            "disclaimer": "Bukan diagnosis medis"
        }
    except Exception as e:
        error_message = str(e)
        if "503" in error_message or "UNAVAILABLE" in error_message or "overloaded" in error_message.lower():
            return {
                "answer": "⚠️ **Layanan AI sementara tidak tersedia**\n\nModel AI sedang mengalami beban tinggi. Silakan coba lagi dalam beberapa menit.\n\n**Saran sementara:**\n- Gunakan pengetahuan klinis Anda untuk penilaian awal\n- Periksa gejala pasien secara menyeluruh\n- Lakukan pemeriksaan fisik dan tes dasar\n- Konsultasikan dengan spesialis jika diperlukan",
                "sources": ["Fallback Response"],
                "disclaimer": "Bukan diagnosis medis - layanan AI tidak tersedia"
            }
        elif "429" in error_message or "rate limit" in error_message.lower():
            return {
                "answer": "⚠️ **Batas permintaan tercapai**\n\nTerlalu banyak permintaan dalam waktu singkat. Silakan tunggu sebentar sebelum mencoba lagi.\n\n**Informasi alternatif:**\n- Tinjau pedoman TB WHO secara manual\n- Gunakan alat diagnostik standar\n- Konsultasikan dengan tim medis",
                "sources": ["Rate Limited"],
                "disclaimer": "Bukan diagnosis medis - batas permintaan tercapai"
            }
        else:
            return {
                "answer": f"⚠️ **Kesalahan sistem**\n\nTerjadi kesalahan saat memproses permintaan Anda: {error_message[:100]}...\n\nSilakan coba lagi atau hubungi administrator sistem.",
                "sources": ["Error Response"],
                "disclaimer": "Bukan diagnosis medis - kesalahan sistem"
            }

def record_rag_answer(question: str, record_data: dict, query_type: str = "quick"):
    """
    Generate RAG answer specific to a patient record
    """
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

    # Extract record-specific context
    record_context = build_record_context(record_data)

    # Format question based on type and record context
    if query_type == "diagnosis":
        formatted_question = f"""
PERMINTAAN BANTUAN DIAGNOSIS PASIEN SPESIFIK:

Data Pasien:
{record_context}

Pertanyaan Klinis: {question}

Berikan dukungan pengambilan keputusan klinis spesifik untuk pasien ini berdasarkan data rekam medis di atas.
Pertimbangkan riwayat pasien, hasil X-ray, dan konteks klinis spesifik.
"""
    else:  # quick guidance
        formatted_question = f"""
KONSULTASI KLINIS PASIEN SPESIFIK:

Data Pasien:
{record_context}

Pertanyaan: {question}

Berikan bimbingan klinis yang dipersonalisasi berdasarkan data pasien di atas.
"""

    # Embed user question with record context
    q_embed = MODEL.encode([formatted_question])
    _, I = index.search(q_embed, 3)  # Fewer chunks since we have specific record data

    # Build context from clinical guidelines
    clinical_context = "\n".join([chunks[i] for i in I[0]])

    # Combine record context with clinical guidelines
    full_context = f"""
DATA REKAM MEDIS PASIEN:
{record_context}

PEDOMAN KLINIS REFERENSI:
{clinical_context}
"""

    # Call Gemini with record-specific context
    try:
        response = call_gemini_with_retry(f"""
{SYSTEM_PROMPT}

Konteks Pasien Spesifik:
{full_context}

Pertanyaan:
{formatted_question}

Instruksi: Berikan jawaban yang sangat spesifik untuk pasien ini berdasarkan data rekam medis mereka.
Jangan berikan nasihat umum - fokus pada situasi klinis pasien ini.
""")
        return {
            "answer": response.text,
            "sources": ["Data Rekam Medis Pasien", "Pedoman TB WHO / SOP Kemenkes"],
            "disclaimer": "Bukan diagnosis medis - konsultasikan dengan spesialis"
        }
    except Exception as e:
        error_message = str(e)
        if "503" in error_message or "UNAVAILABLE" in error_message or "overloaded" in error_message.lower():
            return {
                "answer": "⚠️ **Layanan AI sementara tidak tersedia**\n\nModel AI sedang mengalami beban tinggi. Silakan coba lagi dalam beberapa menit.\n\n**Saran alternatif untuk pasien ini:**\n- Tinjau data rekam medis secara manual\n- Gunakan pengetahuan klinis Anda untuk penilaian\n- Lakukan pemeriksaan fisik menyeluruh\n- Pertimbangkan konsultasi dengan spesialis TB",
                "sources": ["Fallback Response"],
                "disclaimer": "Bukan diagnosis medis - layanan AI tidak tersedia"
            }
        elif "429" in error_message or "rate limit" in error_message.lower():
            return {
                "answer": "⚠️ **Batas permintaan tercapai**\n\nTerlalu banyak permintaan dalam waktu singkat. Silakan tunggu sebentar sebelum mencoba lagi.\n\n**Informasi pasien tersedia:**\n- Data rekam medis lengkap dapat dilihat di atas\n- Riwayat konsultasi tersimpan dalam record\n- Hasil X-ray tersedia untuk review manual",
                "sources": ["Rate Limited"],
                "disclaimer": "Bukan diagnosis medis - batas permintaan tercapai"
            }
        else:
            return {
                "answer": f"⚠️ **Kesalahan sistem**\n\nTerjadi kesalahan saat memproses konsultasi pasien ini: {error_message[:100]}...\n\n**Data pasien masih tersedia untuk review manual:**\n- Riwayat lengkap dapat dilihat di record\n- Hasil pemeriksaan tersimpan\n- Chat history tersedia",
                "sources": ["Error Response"],
                "disclaimer": "Bukan diagnosis medis - kesalahan sistem"
            }


def build_record_context(record_data: dict) -> str:
    """
    Build comprehensive context from patient record data
    """
    context_parts = []

    # Patient Information
    if "patientInfo" in record_data:
        patient = record_data["patientInfo"]
        context_parts.append("INFORMASI PASIEN:")
        if patient.get("age"): context_parts.append(f"- Usia: {patient['age']} tahun")
        if patient.get("gender"): context_parts.append(f"- Jenis Kelamin: {patient['gender']}")
        if patient.get("symptoms"): context_parts.append(f"- Gejala: {patient['symptoms']}")
        if patient.get("duration"): context_parts.append(f"- Durasi Gejala: {patient['duration']}")
        if patient.get("contactHistory"): context_parts.append(f"- Riwayat Kontak: {patient['contactHistory']}")
        if patient.get("comorbidities"): context_parts.append(f"- Penyakit Penyerta: {patient['comorbidities']}")
        if patient.get("vitalSigns"): context_parts.append(f"- Tanda Vital: {patient['vitalSigns']}")
        if patient.get("physicalExam"): context_parts.append(f"- Pemeriksaan Fisik: {patient['physicalExam']}")

    # X-ray Results
    if "xrayResult" in record_data and record_data["xrayResult"]:
        xray = record_data["xrayResult"]
        context_parts.append("\nHASIL ANALISIS X-RAY:")
        if xray.get("risk_level"): context_parts.append(f"- Tingkat Risiko: {xray['risk_level']}")
        if xray.get("confidence"): context_parts.append(f"- Tingkat Kepercayaan: {xray['confidence'] * 100:.1f}%")
        if xray.get("observations"): context_parts.append(f"- Observasi: {xray['observations']}")
        if xray.get("recommendations"): context_parts.append(f"- Rekomendasi: {xray['recommendations']}")
        if xray.get("follow_up_questions"):
            context_parts.append("- Pertanyaan Lanjutan:")
            for q in xray["follow_up_questions"]:
                context_parts.append(f"  • {q}")

    # Assessment/Result
    if "result" in record_data:
        context_parts.append(f"\nASSESMENT AWAL: {record_data['result']}")

    # Previous Chat History
    if "chatHistory" in record_data and record_data["chatHistory"]:
        context_parts.append("\nRIWAYAT KONSULTASI SEBELUMNYA:")
        for chat in record_data["chatHistory"][-5:]:  # Last 5 conversations
            context_parts.append(f"Q: {chat.get('question', '')}")
            context_parts.append(f"A: {chat.get('response', '')}")
            context_parts.append("---")

    # Status and Date
    if "status" in record_data:
        context_parts.append(f"\nSTATUS: {record_data['status']}")
    if "date" in record_data:
        context_parts.append(f"TANGGAL: {record_data['date']}")

    return "\n".join(context_parts)
