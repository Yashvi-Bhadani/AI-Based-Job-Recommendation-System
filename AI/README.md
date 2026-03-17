# AI Service — AI Job Matcher

This is the Python FastAPI service that parses resumes and returns job recommendations.

## Setup

```bash
cd AI
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## Run

```bash
uvicorn app:app --reload --port 8000
```

## API Endpoints

- `GET /` — health check
- `POST /parse` — parse resume and return recommendations
  - Body: `{ "filePath": "path/to/resume.pdf" }`

## How It Connects to Backend

The Node.js backend calls `POST http://localhost:8000/parse` after a resume is uploaded.
The backend route is `POST /api/ai/match` which accepts `{ resumeId }`.
