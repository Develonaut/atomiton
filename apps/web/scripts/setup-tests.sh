#!/bin/bash

# Playwright Testing Setup Script for Atomiton Web App
# Run this script to set up the testing environment

set -e

echo "🎭 Setting up Playwright testing environment for Atomiton Web App"
echo "================================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "tests" ]; then
    echo "❌ Error: Please run this script from the web app root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi

echo "🎭 Installing Playwright browsers..."
npx playwright install

echo "✅ Verifying installation..."
npx playwright --version

echo "🧪 Running a quick smoke test..."
if command -v pnpm &> /dev/null; then
    pnpm run test:critical --reporter=list --max-failures=1
else
    npm run test:critical -- --reporter=list --max-failures=1
fi

echo ""
echo "🎉 Playwright setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm run test              # Run all tests"
echo "  pnpm run test:critical     # Run smoke tests"
echo "  pnpm run test:visual       # Run visual snapshots"
echo "  pnpm run test:headed       # Run with browser visible"
echo "  pnpm run test:debug        # Debug tests"
echo "  pnpm run test:ui           # Interactive UI mode"
echo ""
echo "📖 See tests/README.md for detailed documentation"