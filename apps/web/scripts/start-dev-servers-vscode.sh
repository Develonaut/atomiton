#!/bin/bash

# Simple script to start dev servers - run each command in VSCode manually
echo "🚀 Starting development servers..."
echo ""
echo "This script will start both servers. You'll need to:"
echo "1. Split the terminal (Cmd+\\ or click the split terminal icon)"
echo "2. The servers will run in the split panes"
echo ""

# Kill any existing servers first
./scripts/kill-dev-servers.sh

echo "Starting Next.js in current terminal..."
npm run dev &
NEXTJS_PID=$!

echo "Starting Vite in background..."
npm run dev:vite &
VITE_PID=$!

echo ""
echo "✅ Both servers are starting:"
echo "📝 Next.js (PID: $NEXTJS_PID): http://localhost:3000"
echo "📝 Vite (PID: $VITE_PID): http://localhost:3001"
echo ""
echo "⏳ Waiting 10 seconds for servers to fully start..."
sleep 10

echo "✨ Servers should be ready!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait