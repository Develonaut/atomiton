#!/bin/bash

# Kill Development Servers Script
# Stops all development servers and cleans up ports

set -e

echo "🔄 Stopping all development servers..."

# Kill processes by name patterns
echo "📦 Killing Node.js development processes..."
pkill -f "vite.*dev\|electron.*dev\|turbo.*dev\|pnpm.*dev\|npm.*dev" 2>/dev/null || true

# Kill processes on specific development ports
echo "🔌 Freeing development ports (5173, 5174, 5175)..."
lsof -ti:5173,5174,5175 2>/dev/null | xargs -r kill -9 2>/dev/null || true

# Wait a moment for processes to cleanup
sleep 2

# Verify ports are free
echo "✅ Checking if ports are free..."
if lsof -i:5173,5174,5175 2>/dev/null; then
    echo "⚠️  Some ports are still in use. Trying force kill..."
    lsof -ti:5173,5174,5175 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    sleep 1
fi

echo "✨ Development servers stopped successfully!"
echo "   Ports 5173, 5174, 5175 are now available"