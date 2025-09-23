# Testing Migration Prompt - Automated Structure Update

## Instructions for AI Agent

You are tasked with migrating the entire Atomiton test suite to follow the new simplified testing structure. You will identify all violations and fix them according to our new rules.

## Migration Scope

You will:
1. **Find all test files** with banned extensions
2. **Rename files** to use only `.test.ts` or `.e2e.ts`
3. **Move files** to correct locations based on test type
4. **Update imports** in files that reference moved tests
5. **Update package.json scripts** to match new structure
6. **Report all changes** made

## Simplified Rules to Enforce

### Only 2 File Extensions Allowed
- `*.e2e.ts` - E2E Playwright tests (ONLY in `apps/e2e/tests/`)
- `*.test.ts` - All other tests (unit/integration/contract/benchmark)

### Folder Structure Determines Type
```
apps/e2e/tests/           # All E2E tests (*.e2e.ts)
src/integration/          # Integration tests (*.test.ts)
src/[file].test.ts       # Co-located unit tests (*.test.ts)
```

## Step-by-Step Migration Process

### Step 1: Discovery Phase

Execute these commands to find all violations:

```bash
# Find all banned file extensions
find . -type f \( \
  -name "*.spec.ts" -o \
  -name "*.spec.tsx" -o \
  -name "*.int.test.ts" -o \
  -name "*.int.test.tsx" -o \
  -name "*.smoke.test.ts" -o \
  -name "*.smoke.test.tsx" -o \
  -name "*.bench.test.ts" -o \
  -name "*.bench.test.tsx" -o \
  -name "*.unit.test.ts" -o \
  -name "*.unit.test.tsx" -o \
  -name "*.e2e.test.ts" -o \
  -name "*.e2e.test.tsx" -o \
  -name "*.contract.test.ts" -o \
  -name "*.contract.test.tsx" \
\) | grep -v node_modules | sort

# Find E2E files NOT in apps/e2e/tests/
find . -name "*.e2e.ts" | grep -v "apps/e2e/tests" | grep -v node_modules

# Find test files that might be integration tests (not in integration/ folder)
find . -path "*/src/*.test.ts" -not -path "*/integration/*" -not -path "*/node_modules/*" | xargs grep -l "mock\|stub\|fake\|describe.*API\|describe.*pipeline\|describe.*transform" 2>/dev/null

# Find React component tests that should be E2E
find . -name "*.test.tsx" | xargs grep -l "render\|@testing-library/react" 2>/dev/null | grep -v node_modules

# Find Electron/Desktop tests that should be E2E
grep -r "electron\|ipcMain\|ipcRenderer\|app\.quit\|BrowserWindow" --include="*.test.ts" --include="*.test.tsx" apps/desktop packages 2>/dev/null | cut -d: -f1 | sort -u
```

### Step 2: Classification Phase

For each test file found, classify it:

#### A. Should be E2E (move to apps/e2e/tests/*.e2e.ts)
- Contains `render(<Component`
- Uses `@testing-library/react`
- Tests Electron/Desktop features
- Tests UI interactions
- Tests user workflows
- Current `.spec.ts` files (Playwright tests)
- Current `.smoke.test.ts` files (likely E2E)

#### B. Should be Integration (move to src/integration/*.test.ts)
- Tests data pipelines
- Tests API contracts
- Tests package public methods
- Tests transformations (YAML→JSON, etc.)
- Current `.int.test.ts` files
- Contains heavy mocking but tests data flow

#### C. Should be Unit (rename to *.test.ts, keep co-located)
- Tests pure functions
- Tests complex algorithms
- Tests utilities
- No UI, no framework, no side effects
- Current `.unit.test.ts` files

### Step 3: Migration Actions

For each file, perform the appropriate action:

#### For Files Moving to E2E

```bash
# Example: Spec file → E2E
# FROM: src/tests/workflow.spec.ts
# TO: apps/e2e/tests/workflow.e2e.ts

# 1. Move and rename
mv src/tests/workflow.spec.ts apps/e2e/tests/workflow.e2e.ts

# Example: Component test → E2E (requires rewrite)
# FROM: packages/@atomiton/ui/src/components/Button.test.tsx
# TO: apps/e2e/tests/ui-components.e2e.ts

# 1. Create E2E test
cat > apps/e2e/tests/ui-components.e2e.ts << 'EOF'
import { test, expect } from "@playwright/test";

test("button interactions work correctly", async ({ page }) => {
  await page.goto("/components/button");
  await page.click('[data-testid="test-button"]');
  await expect(page.locator('[data-testid="button-result"]')).toHaveText("Clicked");
});
EOF

# 2. Delete original component test
rm packages/@atomiton/ui/src/components/Button.test.tsx
```

#### For Files Moving to Integration

```bash
# Example: API test → Integration folder
# FROM: packages/@atomiton/conductor/src/api.int.test.ts
# TO: packages/@atomiton/conductor/src/integration/api.test.ts

# 1. Create integration folder if needed
mkdir -p packages/@atomiton/conductor/src/integration

# 2. Move and rename
mv packages/@atomiton/conductor/src/api.int.test.ts \
   packages/@atomiton/conductor/src/integration/api.test.ts

# 3. Update imports in the moved file if needed
sed -i 's/\.\.\/api/\.\.\/\.\.\/api/g' packages/@atomiton/conductor/src/integration/api.test.ts
```

#### For Simple Renames

```bash
# Example: Unit test rename
# FROM: src/utils/calculate.unit.test.ts
# TO: src/utils/calculate.test.ts

mv src/utils/calculate.unit.test.ts src/utils/calculate.test.ts
```

### Step 4: Update Package.json Scripts

For each package, update test scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:integration": "vitest run src/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

Remove any references to:
- `test:unit`
- `test:smoke`
- `test:spec`
- `test:int`

For apps with E2E tests:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Step 5: Update Test Configs

#### Update Playwright Config
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.ts', // Changed from *.spec.ts
  // ...
});
```

#### Update Vitest Config
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx'
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '**/*.e2e.ts' // E2E tests handled by Playwright
    ]
  }
});
```

### Step 6: Handle Special Cases

#### React Component Tests → E2E
```typescript
// DELETE this unit test
test("Button renders with label", () => {
  render(<Button label="Click me" />);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});

// CREATE this E2E test instead
test("user can interact with button", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="main-button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

#### Electron Tests → E2E
```typescript
// DELETE this integration test
test("IPC communication works", async () => {
  const mockIpc = createMockIpc();
  // ...
});

// CREATE this E2E test instead
test("desktop file operations work", async () => {
  const app = await electron.launch({ args: ["main.js"] });
  const window = await app.firstWindow();
  await window.click('[data-testid="save-file"]');
  // Test through real UI
});
```

## Migration Report Template

After completing migration, generate this report:

```markdown
# Test Structure Migration Report

**Date**: [Current Date]
**Migrated by**: AI Agent

## Summary

- **Total test files found**: [count]
- **Files migrated**: [count]
- **Files deleted**: [count] (component tests converted to E2E)
- **Files renamed**: [count]
- **Files moved**: [count]

## File Renames

| Original Name | New Name | Reason |
|--------------|----------|---------|
| workflow.spec.ts | workflow.e2e.ts | Spec → E2E rename |
| api.int.test.ts | integration/api.test.ts | Moved to integration folder |
| Button.test.tsx | DELETED | Converted to E2E |
| calc.unit.test.ts | calc.test.ts | Simple rename |

## New E2E Tests Created

| Original Component Test | New E2E Test | Location |
|------------------------|--------------|----------|
| Button.test.tsx | ui-components.e2e.ts | apps/e2e/tests/ |
| Form.test.tsx | form-workflow.e2e.ts | apps/e2e/tests/ |

## Files Moved to Integration

| Original Location | New Location |
|------------------|--------------|
| src/api.test.ts | src/integration/api.test.ts |
| src/transform.test.ts | src/integration/transform.test.ts |

## Config File Updates

Files updated:
- playwright.config.ts (testMatch: '**/*.e2e.ts')
- vitest.config.ts (exclude: '**/*.e2e.ts')
- package.json scripts (removed test:spec, test:int, etc.)

## Import Updates

Files with updated import paths:
- [List files where imports were updated]

## Verification

Post-migration test results:
- `pnpm test`: [PASS/FAIL]
- `pnpm test:integration`: [PASS/FAIL]
- `pnpm test:e2e`: [PASS/FAIL]
- `pnpm build`: [PASS/FAIL]

## Issues Requiring Manual Review

1. [Any complex tests that need human decision]
2. [Tests with unclear classification]
3. [Broken imports that need fixing]
```

## Execution Instructions

1. **Run discovery commands** to find all test files
2. **Classify each test** based on content analysis
3. **Create integration folders** where needed
4. **Move/rename files** according to classification
5. **Update imports** in moved files
6. **Convert component tests to E2E** (don't just move them)
7. **Update test configs** (Playwright and Vitest)
8. **Update package.json scripts**
9. **Run all tests** to verify nothing broke
10. **Generate migration report**

## Expected Outcomes

After migration:
- ✅ Zero files with banned extensions (.spec.ts, .int.test.ts, .unit.test.ts, etc.)
- ✅ All E2E tests in apps/e2e/tests/*.e2e.ts
- ✅ All integration tests in */integration/*.test.ts
- ✅ All unit tests co-located as *.test.ts
- ✅ No React component unit tests (converted to E2E)
- ✅ No Electron tests without UI (converted to E2E)
- ✅ All tests passing

## Common Patterns to Apply

### Pattern 1: Spec Files → E2E
```bash
# Find all .spec.ts files (likely Playwright tests)
find . -name "*.spec.ts" -not -path "*/node_modules/*"

# Rename to .e2e.ts
for file in $(find . -name "*.spec.ts" -not -path "*/node_modules/*"); do
  newfile="${file%.spec.ts}.e2e.ts"
  mv "$file" "$newfile"
done
```

### Pattern 2: Component Tests → E2E
```bash
# Find all component tests
find . -name "*.test.tsx" | xargs grep -l "render("

# For each one, create equivalent E2E test focusing on user interaction
# Then delete the original
```

### Pattern 3: Integration Test Organization
```bash
# Create integration folders
find packages -type d -name "src" -exec mkdir -p {}/integration \;

# Move integration tests
find . -name "*.int.test.ts" -exec sh -c 'mv "$1" "${1%/*}/integration/${1##*/}"' _ {} \;

# Rename to .test.ts
find . -path "*/integration/*.int.test.ts" -exec sh -c 'mv "$1" "${1%.int.test.ts}.test.ts"' _ {} \;
```

### Pattern 4: Simple Renames
```bash
# Rename all .unit.test.ts to .test.ts
find . -name "*.unit.test.ts" -exec sh -c 'mv "$1" "${1%.unit.test.ts}.test.ts"' _ {} \;

# Rename all .bench.test.ts to .test.ts (keep in integration/)
find . -name "*.bench.test.ts" -exec sh -c 'mkdir -p "${1%/*}/integration" && mv "$1" "${1%/*}/integration/${1##*/}"' _ {} \;
find . -path "*/integration/*.bench.test.ts" -exec sh -c 'mv "$1" "${1%.bench.test.ts}.test.ts"' _ {} \;
```

## Notes

- **Component tests cannot be simply moved** - they must be rewritten as E2E tests
- **Update test configs** - Playwright needs to look for .e2e.ts files
- **Update imports** after moving files
- **Test everything** after migration to ensure nothing broke
- **Keep backup** before starting migration (or use git)

---

*Use this prompt to migrate the entire test suite to the new simplified structure.*