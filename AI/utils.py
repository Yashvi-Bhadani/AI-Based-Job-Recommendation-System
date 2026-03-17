import re
import spacy

nlp = spacy.load("en_core_web_sm")

# clean extra whitespace
def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# extract person name using spaCy NER
def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":   # fixed: label_ not label
            return ent.text
    return "Not Found"

# extract location using spaCy NER
def extract_location(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "GPE":      # fixed: label_ not label
            return ent.text
    return "Not Found"

# extract skills by matching against a known skills list
KNOWN_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "node.js", "nodejs",
    "express", "mongodb", "sql", "mysql", "postgresql", "html", "css", "tailwind",
    "machine learning", "deep learning", "data analysis", "pandas", "numpy",
    "scikit-learn", "tensorflow", "keras", "flask", "fastapi", "django",
    "git", "docker", "aws", "linux", "c++", "c#", "php", "ruby", "swift",
    "kotlin", "flutter", "figma", "ui/ux", "rest api", "graphql"
]

def extract_skills(text):
    text_lower = text.lower()
    found = [skill for skill in KNOWN_SKILLS if skill in text_lower]
    return list(set(found))
