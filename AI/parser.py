import os
import pdfplumber
from docx import Document


def parse_resume(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == ".pdf":
        return parse_pdf(file_path)
    elif file_extension in [".docx", ".doc"]:
        return parse_docx(file_path)
    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")


def parse_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return {"raw_text": text.strip()}


def parse_docx(file_path):
    doc = Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return {"raw_text": text.strip()}
