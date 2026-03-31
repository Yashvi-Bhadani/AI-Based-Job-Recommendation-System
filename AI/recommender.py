import os
import json
import requests
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from model import predict_role
from google import genai
from google.genai import types

# ─── LOAD ENV ──────────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

GEMINI_KEY      = os.getenv("GEMINI_API_KEY")
THEIRSTACK_KEY  = os.getenv("THEIRSTACK_API_KEY")
THEIRSTACK_URL  = "https://api.theirstack.com/v1/jobs/search"

# ─── LOAD EMBEDDING MODEL (once at startup) ────────────────────────────────────
print("Loading sentence transformer...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")


# ─── STEP 1: GENERATE SEARCH QUERIES VIA GEMINI ────────────────────────────────
def generate_search_queries(parsed_resume: dict, predicted_role: str) -> list:
    try:
        client = genai.Client(api_key=GEMINI_KEY)

        prompt = f"""
You are a job search expert. Based on the resume data below,
generate exactly 3 job search queries to find the most relevant jobs.

Resume Data:
- Predicted Role: {predicted_role}
- Skills: {', '.join(parsed_resume.get('skills', []))}
- Years of Experience: {parsed_resume.get('years_experience', 0)}
- Education: {', '.join(parsed_resume.get('education', []))}

Rules:
- Each query should be a job title only (2-5 words max)
- Queries should cover slightly different but related roles
- Return ONLY a valid JSON array of 3 strings
- No explanation, no extra text, just the JSON array

Example output format:
["Machine Learning Engineer", "NLP Engineer", "AI Research Scientist"]
"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        queries = json.loads(text)

        print(f"Gemini queries: {queries}")
        return queries[:3]

    except Exception as e:
        print(f"Gemini error: {e}")
        skills = parsed_resume.get("skills", [])[:2]
        fallback = [
            predicted_role,
            f"{skills[0]} engineer" if skills else predicted_role,
            f"{skills[1]} developer" if len(skills) > 1 else predicted_role,
        ]
        print(f"Using fallback queries: {fallback}")
        return fallback


# ─── STEP 2: FETCH JOBS FROM THEIRSTACK ────────────────────────────────────────
def fetch_jobs(queries: list, limit_per_query: int = 10) -> list:
    """
    For each Gemini query, fetch jobs from TheirStack.
    Returns combined unique job list.
    """
    headers = {
        "Authorization": f"Bearer {THEIRSTACK_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    all_jobs  = []
    seen_ids  = set()

    for query in queries:
        try:
            payload = {
                "job_title_or":          [query],
                "posted_at_max_age_days": 30,     # jobs posted in last 30 days
                "limit":                  limit_per_query,
            }

            response = requests.post(
                THEIRSTACK_URL,
                headers=headers,
                json=payload,
                timeout=15
            )

            if response.status_code != 200:
                print(f"TheirStack error for '{query}': {response.status_code}")
                continue

            data = response.json()
            jobs = data.get("data", [])

            for job in jobs:
                job_id = job.get("id")
                if job_id and job_id not in seen_ids:
                    seen_ids.add(job_id)
                    all_jobs.append(job)

            print(f"Query '{query}' → {len(jobs)} jobs fetched")

        except Exception as e:
            print(f"Fetch error for '{query}': {e}")
            continue

    print(f"Total unique jobs fetched: {len(all_jobs)}")
    return all_jobs


# ─── STEP 3: BUILD TEXT FOR EMBEDDING ──────────────────────────────────────────
def build_resume_text(parsed_resume: dict) -> str:
    skills  = " ".join(parsed_resume.get("skills", []))
    edu     = " ".join(parsed_resume.get("education", []))
    exp     = str(parsed_resume.get("years_experience", ""))
    return f"{skills} {exp} years experience {edu}".strip()


def build_job_text(job: dict) -> str:
    title    = job.get("job_title", "")
    skills   = " ".join(job.get("technology_slugs", []))
    keywords = " ".join(job.get("keyword_slugs", [])[:20])  # limit keywords
    snippet  = job.get("description", "")[:300]
    return f"{title} {skills} {keywords} {snippet}".strip()


# ─── STEP 4: SCORE + RANK JOBS ─────────────────────────────────────────────────
def rank_jobs(parsed_resume: dict, jobs: list) -> list:
    """
    Score each job using:
    - 70% semantic similarity (sentence transformers)
    - 20% skill overlap bonus
    - 10% seniority match bonus
    """
    if not jobs:
        return []

    resume_text  = build_resume_text(parsed_resume)
    resume_vec   = embedder.encode([resume_text])

    resume_skills = set(s.lower() for s in parsed_resume.get("skills", []))
    years_exp     = parsed_resume.get("years_experience", 0)

    scored_jobs = []

    for job in jobs:
        try:
            # Semantic similarity
            job_text  = build_job_text(job)
            job_vec   = embedder.encode([job_text])
            sem_score = float(cosine_similarity(resume_vec, job_vec)[0][0])

            # Skill overlap bonus (max 0.20)
            job_skills   = set(job.get("technology_slugs", []))
            job_keywords = set(job.get("keyword_slugs", []))
            all_job_skills = job_skills | job_keywords
            overlap      = len(resume_skills & all_job_skills)
            skill_bonus  = min(overlap * 0.02, 0.20)

            # Seniority match bonus (max 0.10)
            seniority       = job.get("seniority", "").lower()
            seniority_bonus = 0.0
            if years_exp <= 1 and seniority == "entry":
                seniority_bonus = 0.10
            elif 2 <= years_exp <= 4 and seniority == "mid":
                seniority_bonus = 0.10
            elif years_exp >= 5 and seniority == "senior":
                seniority_bonus = 0.10

            final_score = (sem_score * 0.70) + skill_bonus + seniority_bonus

            scored_jobs.append({
                "job_title":      job.get("job_title", ""),
                "company":        job.get("company", ""),
                "location":       job.get("short_location", ""),
                "url":            job.get("url", ""),
                "seniority":      job.get("seniority", ""),
                "remote":         job.get("remote", False),
                "hybrid":         job.get("hybrid", False),
                "date_posted":    job.get("date_posted", ""),
                "salary":         job.get("salary_string", None),
                "match_score":    round(final_score * 100, 1),
                "matched_skills": list(resume_skills & all_job_skills),
            })

        except Exception as e:
            print(f"Scoring error: {e}")
            continue

    # Sort by score descending
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_jobs


# ─── MAIN FUNCTION ─────────────────────────────────────────────────────────────
def get_recommendations(parsed_resume: dict, page: int = 1, page_size: int = 5) -> dict:
    """
    Full pipeline:
    parsed_resume → predict role → generate queries → fetch jobs → rank → return top N

    page=1      → returns jobs 1-5
    page=2      → returns jobs 6-10 (load more)
    page_size=5 → 5 jobs per page
    """
    # Step 1 — predict role
    role_result    = predict_role(parsed_resume)
    predicted_role = role_result["predicted_role"]
    confidence     = role_result["confidence"]
    print(f"Predicted role: {predicted_role} ({confidence}%)")

    # Step 2 — generate search queries
    queries = generate_search_queries(parsed_resume, predicted_role)

    # Step 3 — fetch jobs (10 per query × 3 queries = up to 30 unique jobs)
    all_jobs = fetch_jobs(queries, limit_per_query=10)

    if not all_jobs:
        return {
            "predicted_role": predicted_role,
            "confidence":     confidence,
            "total_found":    0,
            "page":           page,
            "has_more":       False,
            "jobs":           [],
            "message":        "No jobs found. Try again later."
        }

    # Step 4 — rank all jobs
    ranked_jobs = rank_jobs(parsed_resume, all_jobs)

    # Step 5 — paginate (for "load more" feature)
    start    = (page - 1) * page_size
    end      = start + page_size
    paginated = ranked_jobs[start:end]
    has_more  = end < len(ranked_jobs)

    return {
        "predicted_role": predicted_role,
        "confidence":     confidence,
        "total_found":    len(ranked_jobs),
        "page":           page,
        "has_more":       has_more,
        "jobs":           paginated,
    }