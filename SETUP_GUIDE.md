# 📚 Detailed Setup Guide

## 🖥️ System Requirements

### Minimum Requirements
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

### Software Requirements
| Software | Version | Download |
|----------|---------|----------|
| Node.js | 16.x or higher | https://nodejs.org/ |
| Python | 3.8 or higher | https://www.python.org/ |
| Git | Latest | https://git-scm.com/ |
| npm | 7.x or higher | Included with Node.js |
| pip | Latest | Included with Python |

---

## 🚀 Quick Start (Automated Setup)

### **Windows Users**
```bash
# Double-click setup.bat
# OR run in Command Prompt
setup.bat
```

### **macOS/Linux Users**
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh
```

---

## 🔧 Manual Setup (If Automated Script Fails)

### **Step 1: Clone Repository**
```bash
git clone https://github.com/Yashvi-Bhadani/AI-Based-Job-Recommendation-System.git
cd AI-Based-Job-Recommendation-System
```

---

### **Step 2: Setup MongoDB Atlas**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create new project and cluster
4. In "Network Access", add your IP address (or 0.0.0.0/0 for development)
5. Create database user with username and password
6. Get connection string in "Connect" → "Connect your application"
7. Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/databasename?...`

---

### **Step 3: Setup Google OAuth**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Search for "Google+ API" and enable it
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000` (backend)
   - `http://localhost:5000/auth/google/callback`
   - `http://localhost:5173` (frontend, if redirecting)
7. Copy Client ID and Client Secret

---

### **Step 4: Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env  # Windows
# or
cp .env.example .env    # macOS/Linux

# Edit .env with your credentials
# Use your favorite editor to add:
# - MongoDB URI
# - Google OAuth credentials
# - Generate JWT_SECRET and SESSION_SECRET (random strings)

# Start backend server
npm run dev
```

**Expected output:**
```
Server running on http://localhost:5000
```

---

### **Step 5: AI Service Setup**

#### **Windows:**
```bash
cd AI

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your API keys

# Start AI service
python app.py
```

#### **macOS/Linux:**
```bash
cd AI

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your API keys

# Start AI service
python app.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### **Step 6: Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## ✅ Verify Installation

### **Test Backend API**
```bash
curl http://localhost:5000/api/health
# Should return: { "status": "ok" }
```

### **Test AI Service**
```bash
curl http://localhost:8000/docs
# Should open Swagger API documentation
```

### **Test Frontend**
Open browser and go to `http://localhost:5173`

---

## 🔑 Generate Secure Credentials

### **JWT_SECRET & SESSION_SECRET**

#### **Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() * 4)) | Out-String
```

#### **macOS/Linux (bash/zsh):**
```bash
openssl rand -base64 32
```

#### **Python (any OS):**
```python
import secrets
print(secrets.token_urlsafe(32))
```

---

## 🐛 Troubleshooting

### **Port Already in Use**

#### **Windows:**
```bash
# Find process using the port
netstat -ano | findstr :5000

# Kill the process (replace PID with actual PID)
taskkill /PID <PID> /F

# Or use different port in .env: PORT=5001
```

#### **macOS/Linux:**
```bash
# Find process
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port in .env: PORT=5001
```

---

### **MongoDB Connection Failed**

**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Verify MongoDB URI in `.env` is correct
2. Check your IP is whitelisted in MongoDB Atlas (Network Access)
3. Ensure username and password are correct (URL encode special characters: `@` → `%40`)
4. Test connection string:
   ```bash
   mongosh "your_connection_string"
   ```

---

### **Python Virtual Environment Issues**

**Error:** `'python' is not recognized` or `command not found: python3`

**Solution:**
```bash
# Use python3 explicitly
python3 -m venv venv

# For Windows, use the full path if needed
"C:\Program Files\Python\Python3.x\python.exe" -m venv venv
```

---

### **Node Modules Not Found**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s /q node_modules & del package-lock.json  # Windows

npm install
```

---

### **Vite Not Starting**

**Error:** `EADDRINUSE: address already in use :::5173`

**Solution:**
```bash
cd frontend

# Use different port
npm run dev -- --port 5174
```

---

### **Google OAuth Error**

**Error:** `Redirect URI mismatch`

**Solution:**
1. Verify redirect URIs in Google Cloud Console match your URLs
2. Include protocol: `http://` or `https://`
3. For development: add both `http://localhost:5000` and `http://localhost:5173`

---

## 📦 Environment File Structure

### **backend/.env**
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_random_secret_here_min_32_chars
SESSION_SECRET=your_random_secret_here_min_32_chars

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_here

# URLs
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

### **AI/.env**
```env
PORT=8000
DEBUG=False
THEIRSTACK_API_KEY=your_api_key_here
```

---

## 🚀 Development Workflow

### **Terminal 1: Backend**
```bash
cd backend
npm run dev
```

### **Terminal 2: AI Service**
```bash
cd AI
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### **Terminal 3: Frontend**
```bash
cd frontend
npm run dev
```

---

## 📝 Next Steps

1. ✅ Complete setup and verify all services running
2. 📖 Read main [README.md](../README.md) for feature documentation
3. 🚀 Start developing!
4. 📚 Check API documentation at `http://localhost:8000/docs`

---

## 💡 Tips

- **Development**: Keep all three terminals open during development
- **Hot Reload**: Frontend and backend support hot reload (changes apply automatically)
- **Debugging**: Use browser DevTools (F12) for frontend debugging
- **Backend Logs**: Check terminal where you ran `npm run dev` for logs
- **Database**: Use MongoDB Compass for visual database management

---

## 🆘 Still Having Issues?

1. Check the [GitHub Issues](https://github.com/Yashvi-Bhadani/AI-Based-Job-Recommendation-System/issues)
2. Create a new issue with:
   - OS and version
   - Error message
   - Steps to reproduce
   - Screenshots if applicable

---

**Last Updated**: April 2026
