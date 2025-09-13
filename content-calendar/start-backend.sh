#!/bin/bash

echo "🚀 Starting GoedUitje Content Calendar Backend..."

cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Run data migration if database doesn't exist
if [ ! -f "content_calendar.db" ]; then
    echo "🔄 Setting up database with your social media data..."
    python data_migration.py
fi

# Start the server
echo "🌟 Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""
python main.py