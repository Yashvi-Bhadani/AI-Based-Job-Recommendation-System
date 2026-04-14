#!/bin/bash

# AI-Based Job Recommendation System - Setup Script for macOS/Linux

set -e

echo "🚀 AI-Based Job Recommendation System - Setup"
echo "=============================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install from https://www.python.org/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install from https://git-scm.com/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ Python $(python3 --version)"
echo "✅ Git $(git --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend/.env (please update with your credentials)"
else
    echo "ℹ️  backend/.env already exists"
fi

npm install
echo "✅ Backend dependencies installed"
cd ..
echo ""

# Setup AI Service
echo "🤖 Setting up AI Service..."
cd AI

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created Python virtual environment"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ AI dependencies installed"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created AI/.env (please update with your credentials)"
else
    echo "ℹ️  AI/.env already exists"
fi

cd ..
echo ""

# Setup Frontend
echo "⚛️  Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "ℹ️  Frontend node_modules already exists"
fi
cd ..
echo ""

echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "📝 Next Steps:"
echo "1. Update credentials in backend/.env"
echo "2. Update credentials in AI/.env"
echo "3. Run: npm run dev (in backend)"
echo "4. Run: python app.py (in AI folder)"
echo "5. Run: npm run dev (in frontend)"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""
