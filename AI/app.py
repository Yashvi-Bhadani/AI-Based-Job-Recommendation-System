from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_resume
from model import predict_jobs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "AI service running"}

@app.post("/parse")
def parse_file(data: dict):
    file_path = data.get("filePath")

    if not file_path:
        raise HTTPException(status_code=400, detail="filePath is required")

    try:
        parsed_data = parse_resume(file_path)
        recommendations = predict_jobs(parsed_data)

        return {
            "parsedData": parsed_data,
            "recommendations": recommendations
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")
