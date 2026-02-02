import pdfplumber
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BOOKS_FOLDER = os.path.join(BASE_DIR, "books")

_word_re = re.compile(r"[a-z0-9]+")

def tokenize(text):
    return _word_re.findall((text or "").lower())

def score_text(query_tokens, doc_text):
    if not query_tokens:
        return 0.0
    doc_tokens = tokenize(doc_text)
    if not doc_tokens:
        return 0.0
    doc_set = set(doc_tokens)
    hits = sum(1 for t in query_tokens if t in doc_set)
    return hits / max(1, len(set(query_tokens)))

def build_query(data):
    if not isinstance(data, dict):
        return "recommended books"

    if data.get("query") and str(data.get("query")).strip():
        return str(data.get("query")).strip()

    query = f"{data.get('field', '')} {data.get('year', '')} {data.get('interests', '')}".strip()
    return query or "recommended books"

def read_first_15_pages(pdf_path):
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i in range(min(15, len(pdf.pages))):
                try:
                    text += pdf.pages[i].extract_text() or ""
                except Exception:
                    continue
    except Exception:
        return ""
    return text

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json(silent=True) or {}
    query = build_query(data)
    query_tokens = tokenize(query)

    book_texts = []
    books = []

    if not os.path.isdir(BOOKS_FOLDER):
        return jsonify({"books": [], "message": "Books folder not found"}), 200

    for file in os.listdir(BOOKS_FOLDER):
        if file.endswith(".pdf"):
            path = os.path.join(BOOKS_FOLDER, file)
            content = read_first_15_pages(path)
            book_texts.append(content or "")
            books.append({
                "title": file.replace(".pdf", ""),
                "file_name": file
            })

    if not book_texts:
        return jsonify({"books": []})

    scored = []
    for i, text in enumerate(book_texts):
        scored.append((books[i], score_text(query_tokens, text)))

    scored.sort(key=lambda x: x[1], reverse=True)

    threshold = 0.18
    results = [book for book, s in scored if s >= threshold]

    if not results:
        top_n = min(6, len(scored))
        results = [book for book, _ in scored[:top_n]]

    return jsonify({"books": results})

if __name__ == "__main__":
    app.run(port=5000)
