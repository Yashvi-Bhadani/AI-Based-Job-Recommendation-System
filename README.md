# 🤖 AI-Based Job Recommendation System

An intelligent platform that matches candidates with job opportunities using NLP and AI scoring, featuring resume parsing, job matching, and an enhanced dashboard for tracking applications.

---

## ✨ Features

- **🤖 AI-Powered Matching**: Matches resumes against job descriptions using NLP and skill analysis
- **📊 Enhanced Dashboard**: Track applications, job matches, profile views, and recommendations
- **👤 Professional Profile**: Manage skills, bio, work experience, and personal details
- **🔒 Secure Authentication**: Google OAuth with JWT token-based sessions
- **📄 Resume Parser**: Extracts skills, experience, and qualifications from resumes
- **📍 Location-Based Matching**: Filter and match jobs based on location preferences
- **💾 Session History**: View recommendation history and track your interactions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express.js, MongoDB, Passport.js |
| **AI/ML** | Python FastAPI, scikit-learn, NLP (TFIDF, spaCy) |
| **Authentication** | Google OAuth 2.0, JWT |
| **Database** | MongoDB (Cloud) |

---

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** for package management
- **MongoDB Atlas** account (free tier available) - [Sign up](https://www.mongodb.com/cloud/atlas)

---

## 🚀 Setup Instructions

### **1. Clone the Repository**

```bash
git clone https://github.com/Yashvi-Bhadani/AI-Based-Job-Recommendation-System.git
cd AI-Based-Job-Recommendation-System
```

---

### **2. Backend Setup (Node.js + Express)**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env
```

**Edit `.env` file with your credentials:**

```env
# MongoDB Configuration (Get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Security Keys (Generate random strings min 32 characters)
JWT_SECRET=your_random_jwt_secret_key_here_min_32_characters
SESSION_SECRET=your_random_session_secret_key_here_min_32_characters

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:5000` to authorized redirect URIs
6. Copy Client ID and Secret to your `.env`

**Start backend server:**

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

---

### **3. AI Service Setup (Python + FastAPI)**

```bash
# Open new terminal and navigate to AI folder
cd AI

# Create virtual environment (or use existing if available)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `AI/.env` file:**

```env
PORT=8000
DEBUG=False
THEIRSTACK_API_KEY=your_theirstack_api_key_here
```

**Start AI service:**

```bash
python app.py
# or
uvicorn app:app --reload --port 8000
```

AI Service will run on `http://localhost:8000`

---

### **4. Frontend Setup (React + Vite)**

```bash
# Open new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] Backend running on `http://localhost:5000`
- [ ] AI Service running on `http://localhost:8000`
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] Can login with Google OAuth
- [ ] Can upload and parse resume
- [ ] Can see job recommendations

---

## 📁 Project Structure

```
AI-Based-Job-Recommendation-System/
├── backend/                    # Node.js Express server
│   ├── config/                # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── uploads/               # Resume uploads
│   ├── .env.example           # Environment template
│   ├── server.js              # Entry point
│   └── package.json
│
├── AI/                        # Python AI service
│   ├── models/                # Pre-trained ML models
│   ├── app.py                 # FastAPI application
│   ├── model.py               # ML model logic
│   ├── recommender.py         # Recommendation engine
│   ├── resume_scorer.py       # Resume scoring
│   ├── parser.py              # Resume parser
│   ├── .env.example           # Environment template
│   ├── requirements.txt       # Python dependencies
│   └── test_*.py              # Unit tests
│
├── frontend/                  # React Vite application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx           # Entry point
│   ├── public/                # Static assets
│   └── package.json
│
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
└── .github/                   # GitHub configuration
```

---

## 🔑 Environment Variables Summary

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment (dev/prod) | `development` |
| `JWT_SECRET` | JWT signing key | Auto-generate |
| `SESSION_SECRET` | Session encryption key | Auto-generate |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | From Google Cloud |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |
| `AI_SERVICE_URL` | AI Service URL | `http://localhost:8000` |

### AI Service (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | AI service port | `8000` |
| `DEBUG` | Debug mode | `False` |
| `THEIRSTACK_API_KEY` | External API key | Your API key |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### AI Service Tests

```bash
cd AI
pytest
# or test specific file
python test_recommender.py
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows - Find process using port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error

- Verify MongoDB URI in `.env`
- Check if MongoDB Atlas cluster is active
- Ensure your IP is whitelisted in MongoDB Atlas (Network Access)
- Test connection: `mongodb+srv://username:password@cluster.mongodb.net/test`

### Python Dependencies Error

```bash
# Upgrade pip
pip install --upgrade pip

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Not Loading

```bash
# Clear Node modules cache
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 API Documentation

### Key Backend Endpoints

**Authentication:**
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout

**Resume & Jobs:**
- `POST /api/resume/upload` - Upload resume
- `GET /api/jobs` - Get all jobs
- `POST /api/recommendations` - Get job recommendations

**User Profile:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### AI Service Endpoints

- `POST /api/parse_resume` - Parse resume content
- `POST /api/recommend_jobs` - Get recommendations
- `POST /api/score_match` - Score job-resume match

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Team

- **Yashvi Bhadani** – Project Lead & AI Engineer
- **Contributors** – Astha, Full Backend & Security Team

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/Yashvi-Bhadani/AI-Based-Job-Recommendation-System/issues)
- Contact: [Your Email]

---

## 🎯 Roadmap

- [ ] Advanced skill matching algorithm
- [ ] Email notifications for new matches
- [ ] Resume improvement suggestions
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Multi-language support

---

**Last Updated:** April 2026
