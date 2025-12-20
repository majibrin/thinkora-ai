#!/bin/bash

# Thinkora Project Setup Script

echo "🚀 Setting up Thinkora Project..."
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Python
echo "🔍 Checking Python installation..."
python --version || { echo "❌ Python not found"; exit 1; }

# Check Node.js
echo "🔍 Checking Node.js installation..."
node --version || { echo "❌ Node.js not found"; exit 1; }

# Setup Backend
echo -e "\n${GREEN}Setting up Backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install dotenv if not in requirements
pip install python-dotenv

# Setup environment
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your settings${NC}"
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Setup Frontend
echo -e "\n${GREEN}Setting up Frontend...${NC}"
cd ../frontend

# Install Node dependencies
echo "Installing Node dependencies..."
npm install

# Setup environment
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
fi

# Build
echo "Building frontend..."
npm run build

echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and frontend/.env with your configuration"
echo "2. Start backend: cd backend && python manage.py runserver"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "For production:"
echo "- Set DEBUG=False in backend/.env"
echo "- Generate a secure SECRET_KEY"
echo "- Configure a production database"
echo "=============================================="
