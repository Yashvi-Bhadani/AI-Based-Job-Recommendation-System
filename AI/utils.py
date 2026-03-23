import re
import spacy

nlp = spacy.load("en_core_web_sm")

# ─── SKILLS LIBRARY ────────────────────────────────────────────────────────────
SKILLS_DB = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "r", "scala",
    "go", "rust", "kotlin", "swift", "php", "ruby", "matlab",

    # AI / ML
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "reinforcement learning", "transfer learning",
    "neural networks", "transformers", "bert", "gpt",

    # ML Libraries
    "tensorflow", "pytorch", "keras", "scikit-learn", "xgboost", "lightgbm",
    "huggingface", "spacy", "nltk", "opencv", "pandas", "numpy", "scipy",
    "matplotlib", "seaborn", "plotly",

    # Data / DB
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "cassandra", "firebase", "sqlite",

    # Cloud / MLOps
    "aws", "gcp", "azure", "docker", "kubernetes", "mlflow", "airflow",
    "fastapi", "flask", "django", "git", "linux",

    # Data Engineering
    "spark", "hadoop", "kafka", "dbt", "snowflake", "bigquery",

    # Analytics
    "tableau", "power bi", "excel", "google analytics",
}

# ─── NAME EXTRACTION ───────────────────────────────────────────────────────────
def extract_name(text: str) -> str:
    """
    Strategy:
    1. Try spaCy PERSON entity from first 10 lines (most resumes have name on top)
    2. Fallback: first non-empty line that looks like a name (2-4 words, no digits)
    """
    first_chunk = "\n".join(text.strip().splitlines()[:10])
    doc = nlp(first_chunk)

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text.strip()
            # Reject if it contains digits or is too short
            if not re.search(r"\d", name) and len(name.split()) >= 1:
                return name

    # Fallback: first line that looks like a real name
    for line in text.strip().splitlines():
        line = line.strip()
        words = line.split()
        if (
            2 <= len(words) <= 4
            and not re.search(r"[\d@|•\-/]", line)
            and line[0].isupper()
        ):
            return line

    return "Not Found"


# ─── EMAIL ─────────────────────────────────────────────────────────────────────
def extract_email(text: str) -> str:
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else "Not Found"


# ─── PHONE ─────────────────────────────────────────────────────────────────────
def extract_phone(text: str) -> str:
    match = re.search(
        r"(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?)(\d{3}[\s\-]?\d{4})", text
    )
    return match.group(0).strip() if match else "Not Found"


# ─── LOCATION ──────────────────────────────────────────────────────────────────
def extract_location(text: str) -> str:
    first_chunk = "\n".join(text.strip().splitlines()[:15])
    doc = nlp(first_chunk)
    for ent in doc.ents:
        if ent.label_ == "GPE":
            return ent.text
    return "Not Found"


# ─── SKILLS ────────────────────────────────────────────────────────────────────
def extract_skills(text: str) -> list:
    text_lower = text.lower()
    found = set()

    # Multi-word skills first
    for skill in SKILLS_DB:
        if skill in text_lower:
            found.add(skill)

    return sorted(list(found))


# ─── YEARS OF EXPERIENCE ───────────────────────────────────────────────────────
def extract_experience(text: str) -> float:
    """
    Looks for patterns like:
    - "3 years of experience"
    - "2+ years"
    - "five years"
    Returns the highest number found (most relevant for senior roles).
    """
    word_to_num = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
    }

    text_lower = text.lower()
    numbers_found = []

    # Pattern: "3 years" or "3+ years"
    for match in re.finditer(r"(\d+\.?\d*)\+?\s*years?", text_lower):
        numbers_found.append(float(match.group(1)))

    # Pattern: "three years"
    for word, num in word_to_num.items():
        if re.search(rf"\b{word}\s+years?\b", text_lower):
            numbers_found.append(float(num))

    if not numbers_found:
        return 0.0

    # Return max (most representative of total experience)
    return max(numbers_found)


# ─── EDUCATION ─────────────────────────────────────────────────────────────────
def extract_education(text: str) -> list:
    degrees = [
        "b.tech", "m.tech", "btech", "mtech", "b.e", "m.e",
        "bachelor", "master", "phd", "ph.d", "mba", "bsc", "msc",
        "b.sc", "m.sc", "be", "me", "diploma", "10th", "12th",
        "hsc", "ssc", "intermediate", "matriculation"
    ]

    text_lower = text.lower()
    found = []

    lines = text.splitlines()
    for line in lines:
        line_lower = line.lower()
        if any(deg in line_lower for deg in degrees):
            clean = line.strip()
            if clean and clean not in found:
                found.append(clean)

    return found[:5]  # return max 5 education entries


# ─── MASTER PARSER ─────────────────────────────────────────────────────────────
def extract_all(text: str) -> dict:
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "location": extract_location(text),
        "skills": extract_skills(text),
        "years_experience": extract_experience(text),
        "education": extract_education(text),
    }