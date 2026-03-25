# AI-Based Job Recommendation System

An intelligent platform that matches candidates with job opportunities using NLP and AI scoring.

## Features
- **AI Matching**: Matches resumes against job descriptions based on skills and experience.
- **Enhanced Dashboard**: Track applications, job matches, and profile views.
- **Professional Profile**: Manage your skills, bio, and personal details.
- **Google OAuth**: Fast and secure login with Google.

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Yashvi-Bhadani/AI-Based-Job-Recommendation-System.git
cd AI-Based-Job-Recommendation-System
```

### 2. Backend Setup
1. Go to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server: `npm run dev`

### 3. Frontend Setup
1. Open a new terminal and go to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. Open `http://localhost:5173` in your browser.

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, MongoDB, Passport.js (Google OAuth), JWT
- **AI/ML**: NLP analysis for resume parsing and matching

---

## 👥 Team
- **Yashvi Bhadani** – Project Lead & AI Engineer
- **Astha** – Database & Authentication
- **[You]** – Full Backend & Security
- **Team Member** – Frontend Developer
