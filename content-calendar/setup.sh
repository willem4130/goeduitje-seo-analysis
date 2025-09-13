#!/bin/bash

echo "🚀 Setting up GoedUitje Content Calendar..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the content-calendar directory"
    exit 1
fi

# Backend Setup
echo ""
echo "📦 Setting up Python Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run data migration
echo "🔄 Running data migration (importing your social media data)..."
python data_migration.py

echo "✅ Backend setup complete!"
echo ""

# Frontend Setup
echo "🎨 Setting up Next.js Frontend..."
cd ../frontend

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete!"
echo ""

# Final instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the Backend (in one terminal):"
echo "   cd content-calendar/backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "2. Start the Frontend (in another terminal):"
echo "   cd content-calendar/frontend"
echo "   npm run dev"
echo ""
echo "3. Open your browser to: http://localhost:3000"
echo ""
echo "📊 Your calendar will show:"
echo "   • Real performance data from your Instagram & LinkedIn"
echo "   • AI-powered predictions for optimal scheduling"
echo "   • Drag & drop functionality for easy planning"
echo ""
echo "🤖 Performance prediction uses your exact scoring algorithms:"
echo "   • Instagram: (Likes × 1) + (Comments × 5) + (Video Views × 0.1) + (Video Plays × 0.5)"
echo "   • LinkedIn: (Likes × 2) + (Reactions × 2) + (Comments × 10) + (Shares × 15)"
echo ""
echo "Happy content planning! 🗓️✨"