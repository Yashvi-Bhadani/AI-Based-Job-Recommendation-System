from model import predict_role

# Test 1 — AI/ML profile
result1 = predict_role({
    "skills": ["python", "tensorflow", "machine learning", "nlp", "deep learning"],
    "education": ["B.Tech Computer Science"]
})
print("Test 1:", result1)

# Test 2 — Frontend profile
result2 = predict_role({
    "skills": ["react", "javascript", "html", "css", "typescript"],
    "education": ["B.Tech"]
})
print("Test 2:", result2)

# Test 3 — Data Analyst profile
result3 = predict_role({
    "skills": ["sql", "tableau", "excel", "power bi", "statistics"],
    "education": ["MBA"]
})
print("Test 3:", result3)

# Test 4 — DevOps profile
result4 = predict_role({
    "skills": ["docker", "kubernetes", "aws", "jenkins", "linux"],
    "education": ["B.Tech"]
})
print("Test 4:", result4)

# Test 5 — Empty input (edge case)
result5 = predict_role({
    "skills": [],
    "education": []
})
print("Test 5 (empty):", result5)