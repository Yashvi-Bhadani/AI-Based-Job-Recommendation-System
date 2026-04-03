import os
import joblib
import re
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# ─── PATHS ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "job_role_model.pkl")
VEC_PATH   = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
DATA_PATH  = os.path.join(BASE_DIR, "job_descriptions.csv")

os.makedirs(MODELS_DIR, exist_ok=True)


# ─── ROLE GROUPING ─────────────────────────────────────────────────────────────
def group_role(role: str) -> str:
    r = str(role).lower()

    if any(w in r for w in [
        'machine learning', 'ml engineer', 'ai engineer', 'artificial intelligence',
        'nlp', 'deep learning', 'data scien', 'computer vision', 'research scientist'
    ]):
        return "AI/ML Engineer"

    if any(w in r for w in [
        'data analyst', 'business analyst', 'data engineer',
        'database', 'big data', 'etl', 'analytics'
    ]):
        return "Data Analyst/Engineer"

    if any(w in r for w in [
        'frontend', 'front end', 'front-end', 'ui developer',
        'react developer', 'angular developer', 'vue developer', 'web designer'
    ]):
        return "Frontend Developer"

    if any(w in r for w in [
        'full stack', 'fullstack', 'full-stack', 'web developer'
    ]):
        return "Full Stack Developer"

    if any(w in r for w in [
        'backend', 'back end', 'back-end', 'api developer',
        'java developer', 'python developer', 'node developer',
        'software engineer', 'software developer'
    ]):
        return "Backend Developer"

    if any(w in r for w in [
        'devops', 'cloud engineer', 'site reliability',
        'infrastructure', 'systems admin', 'network engineer',
        'network admin'
    ]):
        return "DevOps/Cloud Engineer"

    if any(w in r for w in [
        'android', 'ios developer', 'mobile developer',
        'flutter', 'react native'
    ]):
        return "Mobile Developer"

    if any(w in r for w in [
        'security engineer', 'cyber', 'penetration', 'ethical hack'
    ]):
        return "Security Engineer"

    if any(w in r for w in [
        'qa engineer', 'quality assurance', 'software tester', 'test engineer'
    ]):
        return "QA Engineer"

    if any(w in r for w in [
        'ux', 'ui/ux', 'ux/ui', 'product designer', 'graphic designer'
    ]):
        return "UX/UI Designer"

    if any(w in r for w in [
        'product manager', 'project manager', 'scrum master'
    ]):
        return "Product/Project Manager"

    if any(w in r for w in [
        'marketing', 'seo', 'sem', 'social media', 'content',
        'brand', 'copywriter', 'advertising'
    ]):
        return "Marketing Specialist"

    if any(w in r for w in [
        'financial', 'finance', 'investment', 'accountant',
        'tax', 'audit', 'banker', 'wealth', 'insurance'
    ]):
        return "Finance Specialist"

    if any(w in r for w in [
        'hr ', 'human resource', 'recruiter', 'talent', 'payroll'
    ]):
        return "HR Specialist"

    if any(w in r for w in [
        'sales', 'business development', 'account executive'
    ]):
        return "Sales Specialist"

    if any(w in r for w in [
        'legal', 'lawyer', 'attorney', 'paralegal', 'counsel'
    ]):
        return "Legal Specialist"

    if any(w in r for w in [
        'doctor', 'nurse', 'physician', 'medical',
        'therapist', 'pharmacist', 'dentist', 'surgeon'
    ]):
        return "Healthcare Professional"

    if any(w in r for w in [
        'teacher', 'professor', 'educator', 'instructor', 'trainer'
    ]):
        return "Educator"

    if any(w in r for w in [
        'operations', 'supply chain', 'logistics',
        'procurement', 'warehouse', 'inventory', 'purchasing'
    ]):
        return "Operations Specialist"

    return "Other"


# ─── TRAIN & SAVE MODEL ────────────────────────────────────────────────────────
def train_model():
    print("Loading dataset...")
    df = pd.read_csv(
        DATA_PATH,
        usecols=['Role', 'skills', 'Qualifications'],
        nrows=400000
    )

    # Clean
    df = df.dropna(subset=['Role', 'skills'])
    df['Qualifications'] = df['Qualifications'].fillna('')

    # Combine input features
    df['combined'] = (
        df['skills'].astype(str) + " " +
        df['Qualifications'].astype(str)
    )

    # Group roles
    df['Role_grouped'] = df['Role'].apply(group_role)

    # Keep only roles with min 50 samples
    role_counts = df['Role_grouped'].value_counts()
    valid_roles = role_counts[role_counts >= 50].index
    df = df[df['Role_grouped'].isin(valid_roles)]

    # Sample 200 per role for balanced training
    df = df.groupby('Role_grouped', group_keys=False).apply(
        lambda x: x.sample(min(len(x), 200), random_state=42)
    ).reset_index(drop=True)

    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    print(f"Training on {df.shape[0]} samples, {df['Role_grouped'].nunique()} roles")

    X = df['combined']
    y = df['Role_grouped']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Vectorize
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    # Train
    print("Training Logistic Regression...")
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        C=1.0
    )
    model.fit(X_train_vec, y_train)

    # Evaluate
    y_pred   = model.predict(X_test_vec)
    test_acc = accuracy_score(y_test, y_pred)
    cv_scores = cross_val_score(model, X_train_vec, y_train, cv=5)

    print(f"Test Accuracy:      {test_acc:.4f}")
    print(f"CV Accuracy (mean): {cv_scores.mean():.4f}")
    print(f"CV Accuracy (std):  {cv_scores.std():.4f}")

    # Save
    joblib.dump(model,      MODEL_PATH)
    joblib.dump(vectorizer, VEC_PATH)
    print(f"Model saved:      {MODEL_PATH}")
    print(f"Vectorizer saved: {VEC_PATH}")

    return model, vectorizer


# ─── LOAD SAVED MODEL ──────────────────────────────────────────────────────────
def load_model():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VEC_PATH):
        print("Model not found. Training now...")
        return train_model()

    model      = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
    print("Model loaded from disk.")
    return model, vectorizer


# ─── PREDICT JOB ROLE ──────────────────────────────────────────────────────────
def predict_role(parsed_resume: dict) -> dict:
    """
    Input:  parsed resume dict from utils.py
    Output: predicted role + confidence score
    """
    model, vectorizer = load_model()

    # Build input text same way as training
    skills    = " ".join(parsed_resume.get("skills", []))
    education = " ".join(parsed_resume.get("education", []))
    raw_text  = parsed_resume.get("raw_text", "")

    input_text = f"{skills} {education}".strip()
    if not input_text and raw_text:
        input_text = raw_text

    # If still empty after parser output, attempt heuristic by role-term matching
    if not input_text:
        role_guess = group_role(raw_text or "")
        if role_guess != "Other":
            return {"predicted_role": role_guess, "confidence": 30.0}
        return {"predicted_role": "Unknown", "confidence": 0.0}

    vec    = vectorizer.transform([input_text])
    role   = model.predict(vec)[0]
    proba  = model.predict_proba(vec)[0]
    conf   = round(float(max(proba)) * 100, 1)

    return {
        "predicted_role": role,
        "confidence": conf
    }


# ─── RUN DIRECTLY TO TRAIN ─────────────────────────────────────────────────────
if __name__ == "__main__":
    train_model()