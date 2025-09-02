#!/bin/bash

echo "🎨 Visual Comparison Tool"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ImageMagick is installed (for image comparison)
if ! command -v compare &> /dev/null; then
    echo -e "${YELLOW}⚠️  ImageMagick not installed. Install it for visual diffs:${NC}"
    echo "   brew install imagemagick"
    echo ""
fi

# Kill any existing dev servers first
echo "🔄 Clearing dev server ports..."
./scripts/kill-dev-servers.sh

# Start local dev server in background
echo "🚀 Starting local dev server..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Local server is running on port 3001${NC}"
        break
    fi
    sleep 1
done

if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${RED}❌ Failed to start local server${NC}"
    kill $DEV_PID 2>/dev/null
    exit 1
fi

echo ""

# Cleanup function to kill dev server when done
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $DEV_PID 2>/dev/null
    ./scripts/kill-dev-servers.sh
}
trap cleanup EXIT

# Run the visual comparison tests
echo "📸 Taking screenshots from reference site and local site..."
npx playwright test tests/visual-comparison.spec.ts --grep "Side-by-side" --workers=1

echo ""
echo "📊 Generating visual diff report..."

# Create HTML report
cat > tests/snapshots/comparison/report.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Visual Comparison Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }
        .comparison {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .comparison h2 {
            color: #555;
            margin-top: 0;
        }
        .images {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .image-container {
            text-align: center;
        }
        .image-container img {
            width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .label {
            font-weight: bold;
            margin: 10px 0;
            padding: 5px;
            border-radius: 4px;
        }
        .reference {
            background: #e8f5e9;
            color: #2e7d32;
        }
        .local {
            background: #fff3e0;
            color: #f57c00;
        }
        .route-link {
            display: inline-block;
            margin: 5px;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .route-link:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <h1>🎨 Visual Comparison Report</h1>
    <p>Comparing <strong>brainwave2-app.vercel.app</strong> (reference) vs <strong>localhost:3001</strong> (local)</p>
    
    <div class="navigation">
        <h3>Quick Navigation:</h3>
EOF

# Add navigation links
for file in tests/snapshots/comparison/*-reference.png; do
    if [ -f "$file" ]; then
        basename=$(basename "$file" -reference.png)
        echo "        <a href=\"#$basename\" class=\"route-link\">$basename</a>" >> tests/snapshots/comparison/report.html
    fi
done

echo "    </div>" >> tests/snapshots/comparison/report.html

# Add comparison sections
for file in tests/snapshots/comparison/*-reference.png; do
    if [ -f "$file" ]; then
        basename=$(basename "$file" -reference.png)
        localfile="tests/snapshots/comparison/${basename}-local.png"
        
        echo "    <div class=\"comparison\" id=\"$basename\">" >> tests/snapshots/comparison/report.html
        echo "        <h2>📍 Route: /$basename</h2>" >> tests/snapshots/comparison/report.html
        echo "        <div class=\"images\">" >> tests/snapshots/comparison/report.html
        echo "            <div class=\"image-container\">" >> tests/snapshots/comparison/report.html
        echo "                <div class=\"label reference\">✅ Reference (Vercel)</div>" >> tests/snapshots/comparison/report.html
        echo "                <img src=\"${basename}-reference.png\" />" >> tests/snapshots/comparison/report.html
        echo "            </div>" >> tests/snapshots/comparison/report.html
        echo "            <div class=\"image-container\">" >> tests/snapshots/comparison/report.html
        echo "                <div class=\"label local\">🚧 Local (Vite)</div>" >> tests/snapshots/comparison/report.html
        echo "                <img src=\"${basename}-local.png\" />" >> tests/snapshots/comparison/report.html
        echo "            </div>" >> tests/snapshots/comparison/report.html
        echo "        </div>" >> tests/snapshots/comparison/report.html
        
        # If ImageMagick is installed, create a diff image
        if command -v compare &> /dev/null && [ -f "$localfile" ]; then
            difffile="tests/snapshots/comparison/${basename}-diff.png"
            compare "$file" "$localfile" "$difffile" 2>/dev/null || true
            if [ -f "$difffile" ]; then
                echo "        <div style=\"margin-top: 20px;\">" >> tests/snapshots/comparison/report.html
                echo "            <div class=\"label\" style=\"background: #ffebee; color: #c62828;\">🔍 Visual Diff</div>" >> tests/snapshots/comparison/report.html
                echo "            <img src=\"${basename}-diff.png\" style=\"width: 100%; max-width: 600px;\" />" >> tests/snapshots/comparison/report.html
                echo "        </div>" >> tests/snapshots/comparison/report.html
            fi
        fi
        
        echo "    </div>" >> tests/snapshots/comparison/report.html
    fi
done

echo "</body></html>" >> tests/snapshots/comparison/report.html

echo ""
echo -e "${GREEN}✅ Visual comparison complete!${NC}"
echo ""
echo "📂 View the report:"
echo "   open tests/snapshots/comparison/report.html"
echo ""
echo "🖼️  Screenshots saved in:"
echo "   - tests/snapshots/comparison/*-reference.png (from Vercel)"
echo "   - tests/snapshots/comparison/*-local.png (from localhost)"
if command -v compare &> /dev/null; then
    echo "   - tests/snapshots/comparison/*-diff.png (visual differences)"
fi