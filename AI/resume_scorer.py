import re


def _is_present(value):
    return bool(value and value != "Not Found")


def _count_experience_entries(parsed_resume: dict) -> int:
    experience = parsed_resume.get("experience")
    if isinstance(experience, list):
        return len(experience)

    raw_text = str(parsed_resume.get("raw_text", ""))
    matches = re.findall(r"\b(?:internship|internships|experience|project|projects|worked|work|consultant|contract)\b", raw_text, flags=re.IGNORECASE)
    return min(len(matches), 5)


def _calculate_word_count(parsed_resume: dict) -> int:
    raw_text = str(parsed_resume.get("raw_text", ""))
    words = re.findall(r"\w+", raw_text)
    return len(words)


def _normalize_text_list(value):
    if not value:
        return []
    if isinstance(value, str):
        return [value]
    return list(value)


# ─── SCORE RESUME ─────────────────────────────────────────────────────────────

def score_resume(parsed_resume: dict) -> dict:
    skills = _normalize_text_list(parsed_resume.get("skills", []))
    education = _normalize_text_list(parsed_resume.get("education", []))
    name = parsed_resume.get("name", "")
    email = parsed_resume.get("email", "")
    phone = parsed_resume.get("phone", "")
    years_exp = max(int(parsed_resume.get("years_experience", 0) or 0), 0)
    experience_entries = _count_experience_entries(parsed_resume)
    word_count = _calculate_word_count(parsed_resume)

    skill_count = len(skills)
    skill_score = min(30, skill_count * 3)
    if skill_score < 10 and skill_count >= 5:
        skill_score = 15
    skill_score = min(30, skill_score)

    experience_score = 0
    if experience_entries > 0:
        experience_score += min(15, experience_entries * 5)
    experience_score += min(10, years_exp * 2)
    experience_score = min(25, experience_score)

    education_score = min(20, len(education) * 6)

    contact_score = 0
    contact_score += 5 if _is_present(name) else 0
    contact_score += 5 if _is_present(email) else 0
    contact_score += 5 if _is_present(phone) else 0
    contact_score = min(15, contact_score)

    detail_score = min(10, int(word_count / 40))
    detail_score = min(10, detail_score)

    overall = int(round(skill_score + experience_score + education_score + contact_score + detail_score))
    overall = max(0, min(100, overall))

    if overall >= 90:
        grade = "A"
        label = "Excellent"
    elif overall >= 75:
        grade = "B"
        label = "Good"
    elif overall >= 60:
        grade = "C"
        label = "Average"
    elif overall >= 45:
        grade = "D"
        label = "Needs Work"
    else:
        grade = "F"
        label = "Poor"

    tips = []
    if skill_count < 5:
        tips.append({
            "dimension": "Skills",
            "issue": f"Only {skill_count} skill{'' if skill_count == 1 else 's'} detected",
            "fix": "Add at least 8-10 relevant skills that match your target roles.",
            "impact": "high",
        })
    elif skill_count < 8:
        tips.append({
            "dimension": "Skills",
            "issue": "Skill section is light",
            "fix": "Include more specialized programming languages, frameworks, or tools.",
            "impact": "medium",
        })

    if experience_entries == 0 and years_exp == 0:
        tips.append({
            "dimension": "Experience",
            "issue": "No work, internship, or project experience detected",
            "fix": "Add internships, projects, freelance work, or volunteer experience.",
            "impact": "high",
        })
    elif experience_entries < 2:
        tips.append({
            "dimension": "Experience",
            "issue": "Experience section is short",
            "fix": "Add more concrete roles, responsibilities, and measurable outcomes.",
            "impact": "medium",
        })

    if len(education) == 0:
        tips.append({
            "dimension": "Education",
            "issue": "Education details are missing",
            "fix": "Add your degree, institution, and graduation year.",
            "impact": "high",
        })
    elif len(education) == 1:
        tips.append({
            "dimension": "Education",
            "issue": "Education section is brief",
            "fix": "Add the full program name, institution, and major.",
            "impact": "low",
        })

    missing_contact = []
    if not _is_present(name):
        missing_contact.append("name")
    if not _is_present(email):
        missing_contact.append("email")
    if not _is_present(phone):
        missing_contact.append("phone")
    if missing_contact:
        tips.append({
            "dimension": "Contact",
            "issue": f"Missing contact field(s): {', '.join(missing_contact)}",
            "fix": "Add your name, email, and phone number clearly at the top of the resume.",
            "impact": "high",
        })

    if word_count < 400:
        tips.append({
            "dimension": "Detail",
            "issue": "Resume is shorter than 400 words",
            "fix": "Add project descriptions, achievements, and role details.",
            "impact": "medium",
        })

    if len(tips) == 0:
        tips.append({
            "dimension": "Overall",
            "issue": "Your resume looks strong",
            "fix": "Keep the content focused and continue tailoring it to each job.",
            "impact": "low",
        })

    return {
        "overall": overall,
        "grade": grade,
        "label": label,
        "breakdown": {
            "skills": skill_score,
            "experience": experience_score,
            "education": education_score,
            "contact": contact_score,
            "detail": detail_score,
        },
        "max_scores": {
            "skills": 30,
            "experience": 25,
            "education": 20,
            "contact": 15,
            "detail": 10,
        },
        "tips": tips,
        "word_count": word_count,
        "skill_count": skill_count,
    }
