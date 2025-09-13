#!/bin/bash

# Atomiton Development Process Cleanup Script
# This script kills stale development processes and frees up system resources

echo "🧹 Atomiton Dev Process Cleanup"
echo "================================"

# Function to check and kill processes
check_and_kill() {
    local pattern=$1
    local description=$2
    
    # Count matching processes
    count=$(ps aux | grep -E "$pattern" | grep -v grep | wc -l | tr -d ' ')
    
    if [ "$count" -gt 0 ]; then
        echo "❌ Found $count $description process(es)"
        
        # Show the processes
        echo "   Killing:"
        ps aux | grep -E "$pattern" | grep -v grep | awk '{print "   - PID", $2, ":", $11, $12, $13}' | head -5
        
        # Kill them
        pkill -f "$pattern" 2>/dev/null
        
        # Verify they're gone
        remaining=$(ps aux | grep -E "$pattern" | grep -v grep | wc -l | tr -d ' ')
        if [ "$remaining" -eq 0 ]; then
            echo "   ✅ Killed all $description processes"
        else
            echo "   ⚠️  $remaining processes still running (may need sudo)"
        fi
    else
        echo "✅ No $description processes found"
    fi
    echo ""
}

# Check for test runners
echo "🧪 Checking for test processes..."
check_and_kill "vitest|jest|mocha|ava" "test runner"

# Check for dev servers
echo "🚀 Checking for dev servers..."
check_and_kill "vite.*dev|vite.*serve" "Vite dev server"
check_and_kill "webpack-dev-server|webpack.*serve" "Webpack dev server"
check_and_kill "next dev|next.*dev" "Next.js dev server"

# Check for build tools
echo "🔨 Checking for build processes..."
check_and_kill "turbo run dev|turbo.*build" "Turbo"
check_and_kill "pnpm dev|pnpm.*build|pnpm.*test" "pnpm"
check_and_kill "npm run dev|npm.*build|npm.*test" "npm"
check_and_kill "yarn dev|yarn.*build|yarn.*test" "yarn"

# Check for Node processes in project directory
echo "📦 Checking for stale Node processes in project..."
project_dir="/Users/Ryan/Code/atomiton"
stale_count=$(ps aux | grep node | grep "$project_dir" | grep -v "Visual Studio Code" | grep -v grep | wc -l | tr -d ' ')

if [ "$stale_count" -gt 0 ]; then
    echo "❌ Found $stale_count stale Node process(es) in project directory"
    ps aux | grep node | grep "$project_dir" | grep -v "Visual Studio Code" | grep -v grep | awk '{print "   - PID", $2, ":", $11, $12}' | head -5
    
    # Ask for confirmation before killing project-specific processes
    read -p "   Kill these processes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ps aux | grep node | grep "$project_dir" | grep -v "Visual Studio Code" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
        echo "   ✅ Killed stale project processes"
    fi
else
    echo "✅ No stale Node processes in project"
fi
echo ""

# Check for TypeScript compiler processes
echo "📝 Checking for TypeScript processes..."
check_and_kill "tsserver|typescript.*watch|tsc.*watch" "TypeScript compiler"

# Check for ESLint/Prettier processes
echo "🎨 Checking for linter processes..."
check_and_kill "eslint.*watch|prettier.*watch" "linter"

# Check for Electron processes
echo "⚛️  Checking for Electron processes..."
check_and_kill "electron.*atomiton|Electron.*atomiton" "Electron"

# Port cleanup - check for common dev ports
echo "🔌 Checking for processes on common dev ports..."
ports=(3000 3001 4000 5000 5173 5174 8000 8080 9000)

for port in "${ports[@]}"; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        process_name=$(ps -p $pid -o comm= 2>/dev/null)
        echo "   Port $port: $process_name (PID: $pid)"
    fi
done
echo ""

# Memory check
echo "💾 System Resource Status:"
echo "================================"

# Get memory info
if command -v vm_stat &> /dev/null; then
    # macOS
    mem_info=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    page_size=$(vm_stat | head -1 | grep -o '[0-9]*')
    free_mem=$((mem_info * page_size / 1024 / 1024))
    echo "   Free Memory: ${free_mem}MB"
else
    # Linux
    free_mem=$(free -m | grep "^Mem" | awk '{print $4}')
    echo "   Free Memory: ${free_mem}MB"
fi

# CPU load
load_avg=$(uptime | awk -F'load average:' '{print $2}')
echo "   Load Average:$load_avg"

# Count total Node processes
total_node=$(ps aux | grep -c "[n]ode" | tr -d ' ')
echo "   Total Node processes: $total_node"

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "💡 Tip: Add 'alias devclean=\"$0\"' to your ~/.zshrc for quick access"