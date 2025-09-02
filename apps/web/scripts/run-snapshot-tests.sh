#!/bin/bash

# Script to run snapshot tests with dynamic port detection
# This ensures tests always run against the correct server ports

set -e  # Exit on error

echo "📸 Starting Snapshot Test Runner"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    
    # Kill both servers if they're running
    if [ ! -z "$NEXTJS_PID" ]; then
        echo "Stopping Next.js server (PID: $NEXTJS_PID)"
        kill $NEXTJS_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$VITE_PID" ]; then
        echo "Stopping Vite server (PID: $VITE_PID)"
        kill $VITE_PID 2>/dev/null || true
    fi
    
    # Clean up temp files
    rm -f /tmp/nextjs_output.log /tmp/vite_output.log
    
    echo -e "${GREEN}✨ Cleanup complete${NC}"
}

# Set up trap to cleanup on exit
trap cleanup EXIT

# Function to wait for server and extract port
wait_for_server() {
    local log_file=$1
    local server_name=$2
    local default_port=$3
    local max_wait=30
    local elapsed=0
    
    echo -e "${YELLOW}⏳ Waiting for $server_name to start...${NC}"
    
    while [ $elapsed -lt $max_wait ]; do
        if [ -f "$log_file" ]; then
            # Try to extract port from different possible formats
            local port=""
            
            # Next.js format: "ready on http://localhost:3000" or "Local: http://localhost:3000"
            if [ "$server_name" = "Next.js" ]; then
                port=$(grep -E "(ready|Local).*localhost:[0-9]+" "$log_file" | grep -oE "[0-9]{4}" | head -1)
            fi
            
            # Vite format: "Local:   http://localhost:3001/"
            if [ "$server_name" = "Vite" ]; then
                port=$(grep -E "Local:.*localhost:[0-9]+" "$log_file" | grep -oE "[0-9]{4}" | head -1)
            fi
            
            # Fallback: Look for any port number after "port" keyword
            if [ -z "$port" ]; then
                port=$(grep -iE "port.*[0-9]{4}" "$log_file" | grep -oE "[0-9]{4}" | head -1)
            fi
            
            if [ ! -z "$port" ]; then
                echo -e "${GREEN}✅ $server_name started on port $port${NC}"
                echo "$port"
                return 0
            fi
        fi
        
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    echo -e "${RED}❌ Timeout waiting for $server_name to start${NC}"
    return 1
}

# Step 1: Kill any existing servers
echo -e "\n${YELLOW}🔪 Killing existing dev servers...${NC}"
./scripts/kill-dev-servers.sh

# Step 2: Start Next.js server
echo -e "\n${YELLOW}🚀 Starting Next.js server...${NC}"
npm run dev > /tmp/nextjs_output.log 2>&1 &
NEXTJS_PID=$!
echo "Next.js PID: $NEXTJS_PID"

# Step 3: Start Vite server
echo -e "\n${YELLOW}🚀 Starting Vite server...${NC}"
npm run dev:vite > /tmp/vite_output.log 2>&1 &
VITE_PID=$!
echo "Vite PID: $VITE_PID"

# Step 4: Wait for servers and get ports
NEXTJS_PORT=$(wait_for_server "/tmp/nextjs_output.log" "Next.js" "3000")
NEXTJS_EXIT=$?

VITE_PORT=$(wait_for_server "/tmp/vite_output.log" "Vite" "3001")
VITE_EXIT=$?

# Check if both servers started successfully
if [ $NEXTJS_EXIT -ne 0 ]; then
    echo -e "${RED}Failed to start Next.js server${NC}"
    exit 1
fi

if [ $VITE_EXIT -ne 0 ]; then
    echo -e "${RED}Failed to start Vite server${NC}"
    exit 1
fi

# Step 5: Create dynamic Playwright config
echo -e "\n${YELLOW}📝 Creating dynamic test configuration...${NC}"
cat > /tmp/dynamic-snapshots.spec.ts << EOF
import { test, expect } from "@playwright/test";

const routes = [
  { path: "/", name: "home" },
  { path: "/create", name: "create" },
  { path: "/explore", name: "explore" },
  { path: "/explore/details", name: "explore-details" },
  { path: "/explore/designs", name: "explore-designs" },
  { path: "/explore/animations", name: "explore-animations" },
  { path: "/profile", name: "profile" },
  { path: "/pricing", name: "pricing" },
  { path: "/likes", name: "likes" },
  { path: "/updates", name: "updates" },
  { path: "/sign-in", name: "sign-in" },
  { path: "/create-account", name: "create-account" },
  { path: "/reset-password", name: "reset-password" },
  { path: "/assets/3d-objects", name: "assets-3d-objects" },
  { path: "/assets/materials", name: "assets-materials" },
];

test.describe("Visual Snapshots", () => {
  // Test Next.js on port ${NEXTJS_PORT}
  test.describe("Next.js", () => {
    test.use({ baseURL: "http://localhost:${NEXTJS_PORT}" });
    
    for (const route of routes) {
      test(route.name, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot(\`\${route.name}-nextjs.png\`);
      });
    }
  });

  // Test Vite on port ${VITE_PORT}
  test.describe("Vite", () => {
    test.use({ baseURL: "http://localhost:${VITE_PORT}" });
    
    for (const route of routes) {
      test(route.name, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot(\`\${route.name}-vite.png\`);
      });
    }
  });
});
EOF

# Step 6: Run Playwright tests
echo -e "\n${YELLOW}🎭 Running Playwright snapshot tests...${NC}"
echo -e "Next.js: http://localhost:${NEXTJS_PORT}"
echo -e "Vite: http://localhost:${VITE_PORT}\n"

# Give servers a moment to fully stabilize
sleep 2

# Determine if we should update snapshots
UPDATE_FLAG=""
if [ "$1" == "--update" ] || [ "$1" == "-u" ]; then
    UPDATE_FLAG="--update-snapshots"
    echo -e "${YELLOW}📸 Updating snapshots${NC}"
fi

# Run the tests
npx playwright test /tmp/dynamic-snapshots.spec.ts $UPDATE_FLAG

# Capture test exit code
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✅ Snapshot tests completed successfully!${NC}"
else
    echo -e "\n${RED}❌ Snapshot tests failed with exit code $TEST_EXIT_CODE${NC}"
fi

exit $TEST_EXIT_CODE