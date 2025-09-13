#!/bin/bash

echo "🎨 Starting GoedUitje Content Calendar Frontend..."

cd "$(dirname "$0")/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start the development server
echo "🌟 Starting Next.js development server..."
echo "Calendar will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""
npm run dev