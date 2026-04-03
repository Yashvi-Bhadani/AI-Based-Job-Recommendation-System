from recommender import get_recommendations

# ─── TEST 1: AI/ML Profile ────────────────────────────────────────────────────
print("\n" + "="*60)
print("TEST 1 — AI/ML Profile")
print("="*60)

parsed_resume_1 = {
    "name":             "Yashvi Bhadani",
    "skills":           ["python", "machine learning", "tensorflow",
                         "nlp", "deep learning", "spacy"],
    "years_experience": 3.0,
    "education":        ["B.Tech Computer Science"],
    "location":         "Gujarat, India"
}

result1 = get_recommendations(parsed_resume_1)

print(f"\nPredicted Role: {result1['predicted_role']} ({result1['confidence']}%)")
print(f"Total Jobs Found: {result1['total_found']}")

print("\n--- TOP 5 (for Upload Page) ---")
for i, job in enumerate(result1["top5"], 1):
    print(f"{i}. {job['job_title']} at {job['company']}")
    print(f"   Location:       {job['location']}")
    print(f"   Match Score:    {job['match_score']}%")
    print(f"   Matched Skills: {job['matched_skills']}")
    print(f"   Remote:         {job['remote']}")
    print(f"   URL:            {job['url']}")
    print()

print("\n--- LOCATION BREAKDOWN ---")
print(f"Local jobs (Gujarat):  {len(result1['by_location']['local'])}")
print(f"Country jobs (India):  {len(result1['by_location']['country'])}")
print(f"Global jobs:           {len(result1['by_location']['global'])}")


# ─── TEST 2: Frontend Profile ─────────────────────────────────────────────────
print("\n" + "="*60)
print("TEST 2 — Frontend Profile")
print("="*60)

parsed_resume_2 = {
    "name":             "Test User",
    "skills":           ["react", "javascript", "html", "css",
                         "typescript", "nodejs"],
    "years_experience": 2.0,
    "education":        ["B.Tech Information Technology"],
    "location":         "Mumbai, India"
}

result2 = get_recommendations(parsed_resume_2)

print(f"\nPredicted Role: {result2['predicted_role']} ({result2['confidence']}%)")
print(f"Total Jobs Found: {result2['total_found']}")

print("\n--- TOP 5 ---")
for i, job in enumerate(result2["top5"], 1):
    print(f"{i}. {job['job_title']} at {job['company']}")
    print(f"   Match Score: {job['match_score']}%")
    print(f"   Location:    {job['location']}")
    print()


# ─── TEST 3: Edge Case — Empty Skills ─────────────────────────────────────────
print("\n" + "="*60)
print("TEST 3 — Edge Case (empty skills)")
print("="*60)

parsed_resume_3 = {
    "name":             "Empty User",
    "skills":           [],
    "years_experience": 0,
    "education":        [],
    "location":         ""
}

result3 = get_recommendations(parsed_resume_3)
print(f"Predicted Role: {result3['predicted_role']}")
print(f"Total Found:    {result3['total_found']}")
print(f"Message:        {result3.get('message', 'OK')}")


# ─── TEST 4: Non-tech Profile ─────────────────────────────────────────────────
print("\n" + "="*60)
print("TEST 4 — Non-tech Profile (Marketing)")
print("="*60)

parsed_resume_4 = {
    "name":             "Marketing User",
    "skills":           ["seo", "content marketing", "google analytics",
                         "social media", "brand management"],
    "years_experience": 4.0,
    "education":        ["MBA Marketing"],
    "location":         "Delhi, India"
}

result4 = get_recommendations(parsed_resume_4)

print(f"\nPredicted Role: {result4['predicted_role']} ({result4['confidence']}%)")
print(f"Total Jobs Found: {result4['total_found']}")

print("\n--- TOP 5 ---")
for i, job in enumerate(result4["top5"], 1):
    print(f"{i}. {job['job_title']} at {job['company']}")
    print(f"   Match Score: {job['match_score']}%")
    print()