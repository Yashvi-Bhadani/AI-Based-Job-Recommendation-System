from fastapi import FastAPI, UploadFile, File
import os
import uuid
from parser import parse_resume
from recommender import get_recommendations

app = FastAPI()

UPLOAD_DIR = "../backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/parse")
async def parse_resume_api(file: UploadFile = File(...)):
    try:
        # Use a unique name to avoid collisions
        ext = os.path.splitext(file.filename)[-1] if file.filename else ".pdf"
        safe_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)

        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        print("File saved:", file_path)
        parsed_data = parse_resume(file_path)

        return {"parsedData": parsed_data}
    except Exception as e:
        print("PARSE ERROR:", str(e))
        return {"error": str(e)}


# ─── /recommend ───────────────────────────────────────────────────────────────
class RecommendRequest(BaseModel):
    parsed_resume: dict
    page:          int = 1
    page_size:     int = 15   # backend asks for 15; top 5 shown on upload page
 
 
@app.post("/recommend")
async def recommend_jobs(body: RecommendRequest):
    try:
        result = get_recommendations(
            parsed_resume=body.parsed_resume,
            page=body.page,
            page_size=body.page_size,
        )
        return result
 
    except Exception as e:
        print("RECOMMEND ERROR:", str(e))
        return {"error": str(e), "jobs": []}
 