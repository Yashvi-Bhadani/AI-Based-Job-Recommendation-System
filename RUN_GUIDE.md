# AI Job Matcher Startup Guide

## 1. Environment Setup
- **Backend**: Create `backend/.env` with MongoDB and Google OAuth keys.
- **AI**: Create `AI/.env` with your THEIRSTACK_API_KEY.

## 2. Running the Servers
1. **AI Service**:
   ```bash
   cd AI
   # (assuming venv exists)
   .\venv\Scripts\activate
   python app.py
   ```
2. **Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 3. Admin Access
- URL: `http://localhost:5173/admin`
- User: `admin@aijobmatcher.com`
- Pass: `admin123`
