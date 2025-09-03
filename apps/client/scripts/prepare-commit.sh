#!/bin/bash

# prepare-commit.sh - Auto-fix formatting and linting issues before commit
#
# Usage:
#   ./scripts/prepare-commit.sh                  # Fix issues, stage changes, run checks
#   ./scripts/prepare-commit.sh "commit message" # Fix, stage, check, and commit
#   pnpm prepare-commit                          # Same as above (no message)
#   pnpm prepare-commit "commit message"         # Same as above (with message)
#
# This script will:
# 1. Auto-format all code with Prettier
# 2. Auto-fix linting issues with ESLint
# 3. Stage all changes
# 4. Run all quality checks (format, lint, typecheck, build)
# 5. Create commit if message provided

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Preparing commit - Auto-fixing issues...${NC}"

# Save the commit message if provided
COMMIT_MESSAGE="$1"

# Step 1: Format all code
echo -e "${GREEN}📝 Auto-formatting code...${NC}"
pnpm format:fix

# Step 2: Run lint fix (if available)
if pnpm run --silent lint:fix 2>/dev/null; then
    echo -e "${GREEN}🔍 Auto-fixing lint issues...${NC}"
    pnpm lint:fix
else
    echo -e "${YELLOW}ℹ️  No lint:fix script available, skipping...${NC}"
fi

# Step 3: Stage all changes
echo -e "${GREEN}📦 Staging fixed files...${NC}"
git add -A

# Step 4: Run all checks to verify
echo -e "${GREEN}✅ Running verification checks...${NC}"

# Run format check
echo -e "${YELLOW}  Checking formatting...${NC}"
if ! pnpm format:check; then
    echo -e "${RED}❌ Format check failed - manual intervention needed${NC}"
    exit 1
fi

# Run lint check
echo -e "${YELLOW}  Checking linting...${NC}"
if ! pnpm lint; then
    echo -e "${RED}❌ Lint check failed - manual intervention needed${NC}"
    exit 1
fi

# Run typecheck
echo -e "${YELLOW}  Checking types...${NC}"
if ! pnpm typecheck; then
    echo -e "${RED}❌ Type check failed - manual intervention needed${NC}"
    exit 1
fi

# Run build
echo -e "${YELLOW}  Checking build...${NC}"
if ! pnpm build; then
    echo -e "${RED}❌ Build failed - manual intervention needed${NC}"
    exit 1
fi

echo -e "${GREEN}✨ All checks passed! Ready to commit.${NC}"

# If commit message was provided, create the commit
if [ -n "$COMMIT_MESSAGE" ]; then
    echo -e "${GREEN}📝 Creating commit with message: ${COMMIT_MESSAGE}${NC}"
    git commit -m "$COMMIT_MESSAGE"
    echo -e "${GREEN}✅ Commit created successfully!${NC}"
else
    echo -e "${YELLOW}💡 No commit message provided. Run 'git commit' when ready.${NC}"
fi