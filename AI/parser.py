import os
import pfdplumber
from docx import Document


def parse_resume(file_path):
    file_extension=os.path.splitext(file_path)[1].lower()

    if file_extension==".pdf":
        return parse_pdf(file_path)
    
    elif file_extension=='.docx':
        return parce_docx(file_path)
    else:
        raise ValueError("Unsupported file formate.....")
 
    def parse_pdf(file_path):
        text=""
        with pfdplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text+=page.extract_text() or ""
        return {"raw_text": text}
