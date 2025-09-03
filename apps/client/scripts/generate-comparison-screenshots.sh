#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Starting Visual Comparison Screenshot Generation${NC}"
echo "=================================================="

# Ensure dev server is running
echo -e "\n${YELLOW}📦 Starting development server...${NC}"
npm run dev > /dev/null 2>&1 &
DEV_PID=$!
sleep 5

# Clean up comparison folders
echo -e "\n${YELLOW}🧹 Cleaning up old comparison screenshots...${NC}"
rm -rf tests/snapshots/comparison/desktop/*
rm -rf tests/snapshots/comparison/mobile/*
mkdir -p tests/snapshots/comparison/desktop
mkdir -p tests/snapshots/comparison/mobile

# Generate local app screenshots
echo -e "\n${GREEN}📸 Capturing LOCAL app screenshots...${NC}"
echo "  Desktop..."
npx playwright test tests/snapshots.spec.ts --project=vite-desktop --reporter=list --update-snapshots > /dev/null 2>&1

echo "  Mobile..."
npx playwright test tests/snapshots.spec.ts --project=vite-mobile --reporter=list --update-snapshots > /dev/null 2>&1

# Copy local screenshots to comparison folder
echo -e "\n${YELLOW}📋 Copying local screenshots to comparison folder...${NC}"
for file in tests/snapshots/desktop/*.png; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .png)
    cp "$file" "tests/snapshots/comparison/desktop/${filename}-local.png"
  fi
done

for file in tests/snapshots/mobile/*.png; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .png)
    cp "$file" "tests/snapshots/comparison/mobile/${filename}-local.png"
  fi
done

# Generate reference app screenshots
echo -e "\n${GREEN}📸 Capturing REFERENCE app screenshots...${NC}"
echo "  Desktop..."
npx playwright test tests/capture-reference.spec.ts --project=vite-desktop --reporter=list > /dev/null 2>&1

echo "  Mobile..."
npx playwright test tests/capture-reference.spec.ts --project=vite-mobile --reporter=list > /dev/null 2>&1

# Kill dev server
kill $DEV_PID 2>/dev/null

# Count screenshots
DESKTOP_LOCAL=$(ls tests/snapshots/comparison/desktop/*-local.png 2>/dev/null | wc -l | tr -d ' ')
DESKTOP_REF=$(ls tests/snapshots/comparison/desktop/*-reference.png 2>/dev/null | wc -l | tr -d ' ')
MOBILE_LOCAL=$(ls tests/snapshots/comparison/mobile/*-local.png 2>/dev/null | wc -l | tr -d ' ')
MOBILE_REF=$(ls tests/snapshots/comparison/mobile/*-reference.png 2>/dev/null | wc -l | tr -d ' ')

echo -e "\n${GREEN}✅ Screenshot generation complete!${NC}"
echo "=================================================="
echo -e "📊 Summary:"
echo -e "  Desktop: ${DESKTOP_LOCAL} local, ${DESKTOP_REF} reference"
echo -e "  Mobile: ${MOBILE_LOCAL} local, ${MOBILE_REF} reference"
echo -e "\n📁 Screenshots saved to:"
echo -e "  ${BLUE}tests/snapshots/comparison/desktop/${NC}"
echo -e "  ${BLUE}tests/snapshots/comparison/mobile/${NC}"
echo -e "\n💡 Tip: Open the comparison folder to view side-by-side"