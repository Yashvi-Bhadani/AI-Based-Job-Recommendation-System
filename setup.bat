@echo off
REM AI-Based Job Recommendation System - Setup Script for Windows

echo.
echo 🚀 AI-Based Job Recommendation System - Setup
echo =============================================
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found. Please install from https://www.python.org/
    pause
    exit /b 1
)

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git not found. Please install from https://git-scm.com/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_V=%%i
for /f "tokens=*" %%i in ('python --version') do set PYTHON_V=%%i
for /f "tokens=*" %%i in ('git --version') do set GIT_V=%%i

echo ✅ Node.js %NODE_V%
echo ✅ Python %PYTHON_V%
echo ✅ Git %GIT_V%
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend

if not exist .env (
    copy .env.example .env
    echo ✅ Created backend\.env (please update with your credentials)
) else (
    echo ℹ️  backend\.env already exists
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

REM Setup AI Service
echo 🤖 Setting up AI Service...
cd AI

if not exist venv (
    python -m venv venv
    echo ✅ Created Python virtual environment
)

call venv\Scripts\activate.bat

pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install AI dependencies
    pause
    exit /b 1
)
echo ✅ AI dependencies installed

if not exist .env (
    copy .env.example .env
    echo ✅ Created AI\.env (please update with your credentials)
) else (
    echo ℹ️  AI\.env already exists
)

cd ..
echo.

REM Setup Frontend
echo ⚛️  Setting up Frontend...
cd frontend

if not exist node_modules (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ℹ️  Frontend node_modules already exists
)

cd ..
echo.

echo =============================================
echo ✅ Setup Complete!
echo =============================================
echo.
echo 📝 Next Steps:
echo 1. Update credentials in backend\.env
echo 2. Update credentials in AI\.env
echo 3. Run: npm run dev (in backend folder)
echo 4. Run: python app.py (in AI folder)
echo 5. Run: npm run dev (in frontend folder)
echo.
echo Frontend will be available at: http://localhost:5173
echo.
pause
