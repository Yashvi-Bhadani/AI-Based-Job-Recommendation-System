import re
import spacy
#remove space
def clean_text(text):
    text = re.sub(r"\s+"," ",text)
    return text.strip()

import spacy

nlp = spacy.load("en_core_web_sm")

def extract_name(text):
    doc=nlp(text)
    for ent in doc.ents:
        if ent.label == "PERSON":
            return ent.text
    return "Not Found"

#exrtact location
def extract_location(text):
    doc=nlp(text)
    for ent in doc.ents:
        if ent.label == "GPE":
            return ent.text
    return "Not Found"