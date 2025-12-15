from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import faiss, os, pickle

print(os.getcwd())
MODEL = SentenceTransformer("all-MiniLM-L6-v2")

def ingest_pdfs(pdf_dir="data/guidelines"):
    print("Starting ingest")
    texts = []

    for file in os.listdir(pdf_dir):
        reader = PdfReader(os.path.join(pdf_dir, file))
        for page in reader.pages:
            texts.append(page.extract_text())

    print(f"Extracted {len(texts)} texts")
    embeddings = MODEL.encode(texts)
    print(f"Embeddings shape: {embeddings.shape}")
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index, "data/faiss.index")
    pickle.dump(texts, open("data/chunks.pkl", "wb"))

    print("✅ RAG INGEST DONE")

if __name__ == "__main__":
    ingest_pdfs()
