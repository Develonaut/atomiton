#!/bin/bash

# Script to start dev servers in VSCode integrated terminals

echo "🚀 Starting development servers in VSCode terminals..."

# Check if running in VSCode terminal
if [[ "$TERM_PROGRAM" == "vscode" ]]; then
    # Use VSCode's code command to open new terminals
    # Start Next.js server
    osascript -e 'tell application "Visual Studio Code" to activate'
    osascript -e 'tell application "System Events" to keystroke "`" using {control down, shift down}'
    sleep 0.5
    osascript -e "tell application \"System Events\" to keystroke \"npm run dev\""
    osascript -e 'tell application "System Events" to key code 36' # Enter key
    
    # Start Vite server in another terminal
    sleep 1
    osascript -e 'tell application "System Events" to keystroke "`" using {control down, shift down}'
    sleep 0.5
    osascript -e "tell application \"System Events\" to keystroke \"npm run dev:vite\""
    osascript -e 'tell application "System Events" to key code 36' # Enter key
    
    echo "✅ Dev servers starting in VSCode terminal tabs"
else
    # Fallback to running in background if not in VSCode
    echo "⚠️  Not running in VSCode terminal, starting servers in background..."
    npm run dev > /tmp/nextjs.log 2>&1 &
    npm run dev:vite > /tmp/vite.log 2>&1 &
    echo "✅ Dev servers starting in background"
fi

echo "📝 Next.js: http://localhost:3000"
echo "📝 Vite: http://localhost:3001"
echo ""
echo "⏳ Waiting 10 seconds for servers to start..."
sleep 10