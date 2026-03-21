import os
import pdfplumber
from docx import Document


def parse_resume(file_path: str):
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == ".pdf":
        return parse_pdf(file_path)
    
    elif file_extension == ".docx":
        return parse_docx(file_path)
    else:
        raise ValueError("Unsupported file format. Only .pdf and .docx are supported.")
 
def parse_pdf(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return {"raw_text": text}
    except Exception:
        # Fallback for PDFs that pdfplumber can't read.
        from pdfminer.high_level import extract_text

        extracted = extract_text(file_path) or ""
        return {"raw_text": extracted}


def parse_docx(file_path: str):
    doc = Document(file_path)
    text = "\n".join([p.text for p in doc.paragraphs if p.text])
    return {"raw_text": text}

