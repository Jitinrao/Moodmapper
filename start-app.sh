#!/bin/bash

echo "🚀 Starting Nearby Tracker Application..."

# Kill any existing processes on ports 3000-3005 and 5000-5003
echo "🔄 Cleaning up existing processes..."
lsof -ti:3000,3001,3002,3003,3004,3005,5000,5001,5002,5003 | xargs kill -9 2>/dev/null

# Start backend
echo "🔧 Starting backend server on port 5001..."
cd "/Users/jitinrao/Desktop/Nearby tracker/backend"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo "🎨 Starting frontend on port 3000..."
cd "/Users/jitinrao/Desktop/Nearby tracker/frontend"
PORT=3000 npm start &
FRONTEND_PID=$!

echo "✅ Services started!"
echo "📍 Backend: http://localhost:5001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "🔍 To test Google Maps API:"
echo "   1. Open: http://localhost:3000"
echo "   2. Check browser console for API status"
echo ""
echo "📝 Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
