from utils import extract_skills, clean_text

def predict_jobs(parsed_data):
    raw_text = parsed_data.get("raw_text", "")
    cleaned = clean_text(raw_text)
    extracted_skills = extract_skills(cleaned)

    # job templates with required skills
    JOB_TEMPLATES = [
        {
            "title": "Frontend Developer",
            "required_skills": ["react", "javascript", "html", "css", "typescript", "tailwind"]
        },
        {
            "title": "Backend Developer",
            "required_skills": ["node.js", "nodejs", "express", "mongodb", "sql", "rest api", "python"]
        },
        {
            "title": "Full Stack Developer",
            "required_skills": ["react", "node.js", "mongodb", "javascript", "html", "css"]
        },
        {
            "title": "Data Analyst",
            "required_skills": ["python", "pandas", "numpy", "sql", "data analysis"]
        },
        {
            "title": "Machine Learning Engineer",
            "required_skills": ["python", "machine learning", "scikit-learn", "tensorflow", "keras", "numpy", "pandas"]
        },
        {
            "title": "Python Developer",
            "required_skills": ["python", "flask", "fastapi", "django", "rest api"]
        },
        {
            "title": "UI/UX Designer",
            "required_skills": ["figma", "ui/ux", "html", "css"]
        },
        {
            "title": "DevOps Engineer",
            "required_skills": ["docker", "aws", "linux", "git"]
        },
        {
            "title": "Android Developer",
            "required_skills": ["kotlin", "java", "flutter"]
        },
        {
            "title": "iOS Developer",
            "required_skills": ["swift", "flutter"]
        },
    ]

    recommendations = []

    for job in JOB_TEMPLATES:
        matched = [s for s in job["required_skills"] if s in extracted_skills]
        total = len(job["required_skills"])
        score = round((len(matched) / total) * 100) if total > 0 else 0

        if score > 0:
            recommendations.append({
                "title": job["title"],
                "matchScore": score,
                "matchedSkills": matched,
                "totalRequired": total
            })

    # sort by match score descending
    recommendations.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "extractedSkills": extracted_skills,
        "recommendations": recommendations[:5]  # top 5 matches
    }
