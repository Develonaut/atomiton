#!/bin/bash

# Kill processes on Next.js and Vite dev server ports
# This script safely kills only the dev servers without affecting VSCode terminals

echo "🔍 Checking for processes on dev server ports..."

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local name=$2
    
    # Find PID using lsof (more reliable than fuser on macOS)
    local pid=$(lsof -ti:$port -sTCP:LISTEN)
    
    if [ -n "$pid" ]; then
        # Get process name to verify it's a dev server
        local process_name=$(ps -p $pid -o comm= 2>/dev/null)
        
        # Only kill if it's node/npm/npx/next-server process (not VSCode or other terminals)
        if [[ "$process_name" == *"node"* ]] || [[ "$process_name" == *"npm"* ]] || [[ "$process_name" == *"npx"* ]] || [[ "$process_name" == *"next-server"* ]]; then
            echo "✅ Killing $name server on port $port (PID: $pid)"
            kill -9 $pid 2>/dev/null
        else
            echo "⚠️  Found process '$process_name' on port $port but it's not a dev server, skipping..."
        fi
    else
        echo "ℹ️  No process found on port $port"
    fi
}

# Kill known dev server ports
kill_port 3000 "Next.js"
kill_port 3001 "Vite"
kill_port 3004 "Vite (alternate)"

echo "✨ Done! Dev server ports cleared."