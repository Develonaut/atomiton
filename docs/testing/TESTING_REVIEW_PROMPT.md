# Testing Compliance Review Prompt

## Instructions for AI Agent

You are conducting a testing compliance review of the Atomiton codebase. Your
task is to analyze the test files and structure to ensure they follow our
simplified testing guidelines. You will produce a detailed compliance report
with specific issues and recommendations.

## Your Review Process

1. **Scan the test files** in the following locations:
   - `apps/e2e/tests/` - Should contain ONLY `*.e2e.ts` files
   - `apps/*/src/integration/` - Should contain `*.test.ts` files
   - `apps/*/src/**/*.test.ts` - Co-located unit tests
   - `packages/@atomiton/*/src/integration/` - Should contain `*.test.ts` files
   - `packages/@atomiton/*/src/**/*.test.ts` - Co-located unit tests

2. **Analyze each test file** against our simplified guidelines
3. **Produce a compliance report** with specific violations and fixes

## Testing Guidelines to Enforce

### Core Philosophy (MUST ENFORCE)

**Testing Pyramid Target**:

- E2E Tests: 60% (PRIMARY FOCUS)
- Integration Tests: 30%
- Unit Tests: 10% (MINIMAL)

**Key Principle**: "Test user journeys, not implementation details"

### Simplified File Naming Rules (CRITICAL)

**ONLY 2 file extensions allowed**:

- `*.e2e.ts` - E2E Playwright tests (ONLY in `apps/e2e/tests/`)
- `*.test.ts` - All other tests (unit/integration/contract/benchmark)

**BANNED file names**:

- ❌ `*.spec.ts` or `*.spec.tsx`
- ❌ `*.int.test.ts`
- ❌ `*.smoke.test.ts`
- ❌ `*.bench.test.ts`
- ❌ `*.e2e.test.ts`
- ❌ `*.unit.test.ts`
- ❌ `*.contract.test.ts`

**The folder structure determines test type, not the file name!**

### Test Placement Rules (MUST FOLLOW)

#### Electron/Desktop Features → MUST BE E2E

```typescript
// ❌ VIOLATION: Testing Electron without UI
// desktop/src/integration/electron.test.ts
test("electron IPC communication", async () => {
  const mainProcess = await setupElectronMain();
  // THIS IS WRONG - Test through E2E instead
});

// ✅ CORRECT: E2E test
// apps/e2e/tests/desktop.e2e.ts
test("desktop file save", async () => {
  const app = await electron.launch({...});
  const window = await app.firstWindow();
  await window.click('[data-testid="save-button"]');
});
```

#### UI Interactions → MUST BE E2E

```typescript
// ❌ VIOLATION: Component unit test
// src/components/Button.test.tsx
test("Button renders with label", () => {
  render(<Button />);
});

// ✅ CORRECT: E2E test
// apps/e2e/tests/ui.e2e.ts
test("user clicks button", async ({ page }) => {
  await page.click('[data-testid="button"]');
});
```

#### Data Pipelines → Integration Tests

```typescript
// ✅ CORRECT: Integration test in integration folder
// packages/@atomiton/yaml/src/integration/transform.test.ts
test("YAML to JSON pipeline", () => {
  const result = transformYaml(input);
  expect(result).toBeDefined();
});
```

#### Complex Algorithms → Unit Tests (Co-located)

```typescript
// ✅ CORRECT: Co-located unit test
// packages/@atomiton/editor/src/utils/layout.test.ts
test("calculateNodeLayout handles circular graphs", () => {
  const result = calculateNodeLayout(circularGraph);
  expect(result.positions).toBeDefined();
});
```

### Violations to Identify

#### 🚫 CRITICAL VIOLATIONS (Must Fix Immediately)

1. **Wrong File Extensions**

   ```typescript
   // VIOLATION: Using banned extensions
   "src/api.int.test.ts"; // Should be: src/integration/api.test.ts
   "src/ui.spec.ts"; // Should be: apps/e2e/tests/ui.e2e.ts
   "src/math.unit.test.ts"; // Should be: src/math.test.ts
   ```

   **Report as**: "Banned file extension - rename to .test.ts or .e2e.ts"

2. **Electron Tests Without UI**

   ```typescript
   // VIOLATION: Testing Electron/Desktop without real UI
   test("electron main process", async () => {
     const main = await mockElectronMain();
   });
   ```

   **Report as**: "Electron must be tested via E2E - move to apps/e2e/tests/"

3. **Component Unit Tests**

   ```typescript
   // VIOLATION: Testing React components directly
   test("Component renders", () => {
     render(<Component />);
   });
   ```

   **Report as**: "Component unit test found - convert to E2E test"

4. **UI Tests Outside E2E**

   ```typescript
   // VIOLATION: UI interaction test not in E2E
   test("user fills form", () => {
     fireEvent.click(button);
   });
   ```

   **Report as**: "UI interaction must be E2E - move to apps/e2e/tests/"

5. **Wrong Test Location**
   - E2E tests (\*.e2e.ts) NOT in `apps/e2e/tests/`
   - Integration tests NOT in `integration/` folder
   - Non-co-located unit tests

6. **Excessive Mocking**
   ```typescript
   // VIOLATION: Mocking core functionality
   vi.mock("../api");
   vi.mock("../store");
   vi.mock("../electron");
   ```
   **Report as**: "Excessive mocking - use real implementations via E2E"

#### ⚠️ MAJOR VIOLATIONS (Should Fix)

1. **Missing data-testid**

   ```typescript
   // VIOLATION: Using complex selectors
   await page.click(".btn.primary:first-child");
   ```

   **Report as**: "Missing data-testid - add semantic test identifiers"

2. **Poor Test Organization**
   - Integration tests mixed with unit tests
   - E2E tests not organized by user journey
   - No clear folder structure

3. **Inconsistent Naming Pattern**

   ```typescript
   // VIOLATION: Using 'test' instead of 'it' with describe
   describe("Feature", () => {
     test("should work", () => {}); // Should use 'it'
   });
   ```

   **Report as**: "Use describe/it pattern consistently"

4. **Slow Tests**
   - Unit tests taking >100ms
   - Integration tests taking >10s per package
   - E2E tests taking >60s per journey

#### ℹ️ MINOR VIOLATIONS (Nice to Fix)

1. **No Parallel Execution**

   ```typescript
   test("action 1", async () => {});
   test("action 2", async () => {});
   // Could use: test.concurrent()
   ```

2. **Missing Edge Cases**
   - No timeout handling tests
   - No error recovery tests

## Report Template to Generate

````markdown
# Atomiton Testing Compliance Report

**Date**: [Current Date] **Reviewed by**: AI Agent **Overall Compliance Score**:
[X]%

## Executive Summary

[Brief 2-3 sentence overview focusing on file naming compliance and test
placement]

## File Naming Compliance

### ❌ CRITICAL: Banned File Extensions Found ([count])

**Files that MUST be renamed**:

- `src/api.int.test.ts` → Rename to `src/integration/api.test.ts`
- `src/button.spec.ts` → Move to `apps/e2e/tests/button.e2e.ts`
- `src/calc.unit.test.ts` → Rename to `src/calc.test.ts`

**Rule**: Only `.test.ts` and `.e2e.ts` allowed. Folder structure determines
type.

### ❌ CRITICAL: Wrong File Locations ([count])

**E2E tests in wrong location**:

- `apps/client/src/ui.e2e.ts` → Move to `apps/e2e/tests/ui.e2e.ts`

**Integration tests not in integration folder**:

- `packages/@atomiton/yaml/src/transform.test.ts` → Move to
  `src/integration/transform.test.ts`

## Test Placement Violations

### 🚫 Electron/Desktop Tests Without UI ([count] found)

**Severity**: CRITICAL - These MUST be E2E tests

**Files affected**:

- `apps/desktop/src/integration/electron.test.ts`
  - Line 15: Testing IPC without UI
  - Line 45: Testing file system without UI **Fix**: Delete and rewrite as E2E
    test in `apps/e2e/tests/desktop.e2e.ts`

### 🚫 UI Component Unit Tests ([count] found)

**Severity**: CRITICAL - UI must be tested via E2E

**Files affected**:

- `packages/@atomiton/ui/src/Button.test.tsx`
  - Testing render and props **Fix**: Delete and add E2E test for button
    interactions

- `apps/client/src/components/Form.test.tsx`
  - Testing form validation rendering **Fix**: Convert to E2E test of form
    submission flow

## Testing Distribution Analysis

### Current Distribution

- E2E Tests: [X]% ([count] tests in apps/e2e/tests/\*.e2e.ts)
- Integration Tests: [X]% ([count] tests in _/integration/_.test.ts)
- Unit Tests: [X]% ([count] co-located \*.test.ts files)

### Target Distribution

- E2E Tests: 60% (GOAL)
- Integration Tests: 30% (GOAL)
- Unit Tests: 10% (GOAL)

### Distribution Verdict: [PASS/FAIL]

[Explanation focusing on whether there are enough E2E tests]

## Specific Migration Actions

### Files to Rename (This Week)

| Current Name        | New Name                   | Action                  |
| ------------------- | -------------------------- | ----------------------- |
| `api.int.test.ts`   | `integration/api.test.ts`  | Move to folder + rename |
| `ui.spec.ts`        | `apps/e2e/tests/ui.e2e.ts` | Convert to E2E          |
| `math.unit.test.ts` | `math.test.ts`             | Simple rename           |

### Tests to Convert to E2E (This Week)

1. **All Electron/Desktop tests**
   - `desktop/src/integration/` → `apps/e2e/tests/desktop.e2e.ts`
2. **All UI component tests**
   - `*/components/*.test.tsx` → `apps/e2e/tests/[journey].e2e.ts`

### Tests to Move to Integration Folders

- `packages/@atomiton/yaml/src/transform.test.ts` → `src/integration/`
- `packages/@atomiton/conductor/src/pipeline.test.ts` → `src/integration/`

## Positive Findings

### ✅ What's Working Well

- [List files following the new simplified structure]
- [E2E tests properly in apps/e2e/tests/]
- [Integration tests properly in integration/ folders]
- [Unit tests properly co-located]

## Code Examples from Your Codebase

### ✅ Good Example Found

```typescript
// From: apps/e2e/tests/workflow.e2e.ts
// Correctly testing Electron+UI together
test("desktop app saves workflow", async () => {
  const app = await electron.launch({...});
  const window = await app.firstWindow();
  await window.click('[data-testid="save-button"]');
  // Tests real user journey
});
```
````

### ❌ Bad Example Found

```typescript
// From: apps/desktop/src/electron.int.test.ts
// WRONG: Testing Electron without UI
test("IPC communication", async () => {
  const main = setupMockMain();
  // Should be E2E test instead
});
```

## Migration Effort Estimate

**File renames needed**: [count] **Tests to convert to E2E**: [count] **Tests to
move to integration/**: [count] **Estimated effort**: [X] developer days

**Priority order**:

1. Rename all files with banned extensions (2 hours)
2. Move Electron tests to E2E (1 day)
3. Convert UI component tests to E2E (2 days)
4. Organize integration tests into folders (4 hours)

## Key Rules Reminder

1. **Only 2 file extensions**: `.test.ts` and `.e2e.ts`
2. **Electron/Desktop = Always E2E** (Testing without UI is painful)
3. **UI Interactions = Always E2E**
4. **Folder structure tells the story**, not file names
5. **When in doubt, go E2E**

## Summary

**Critical Issues**: [count]

- Banned file extensions: [count]
- Electron tests without UI: [count]
- Component unit tests: [count]

**Quick Wins**:

- Rename [count] files to remove banned extensions
- Move [count] integration tests to proper folders

**Next Review Date**: [1 month from now]

---

_Generated by Atomiton Testing Compliance Reviewer_ _Guidelines:
/docs/testing/README.md_ _Simplified rules: /docs/testing/WHEN_AND_WHERE.md_

````

## Review Commands to Execute

When conducting the review, execute these commands:

```bash
# Find ALL banned file extensions (CRITICAL)
find . \( -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*.int.test.ts" -o -name "*.smoke.test.ts" -o -name "*.bench.test.ts" -o -name "*.unit.test.ts" -o -name "*.e2e.test.ts" -o -name "*.contract.test.ts" \) | grep -v node_modules

# Find E2E files NOT in apps/e2e/tests/
find . -name "*.e2e.ts" | grep -v "apps/e2e/tests" | grep -v node_modules

# Find Electron/Desktop tests not in E2E
grep -r "electron\|ipcMain\|ipcRenderer\|app\.quit" --include="*.test.ts" apps/desktop packages

# Find React component tests
grep -r "render(<\|@testing-library/react" --include="*.test.ts" --include="*.test.tsx"

# Find integration tests not in integration folders
find . -path "*/src/*.test.ts" -not -path "*/integration/*" -not -path "*/node_modules/*" | xargs grep -l "mock\|stub\|fake"

# Check for excessive mocking
grep -r "vi.mock\|jest.mock" --include="*.test.ts" | wc -l

# Find tests without data-testid
grep -r "querySelector\|getElementsBy\|className" --include="*.e2e.ts"

# Measure test execution time
pnpm test:speed-check
````

## Success Criteria

The codebase is compliant when:

- ✅ **ZERO banned file extensions** (no .spec.ts, .int.test.ts, .smoke.test.ts,
  etc.)
- ✅ **Only 2 file types**: .test.ts and .e2e.ts
- ✅ **All E2E tests in apps/e2e/tests/**
- ✅ **All Electron/Desktop tests are E2E**
- ✅ **Zero component unit tests**
- ✅ **All integration tests in integration/ folders**
- ✅ **Testing distribution within 10% of 60/30/10 target**
- ✅ **All E2E tests use data-testid**
- ✅ **No excessive mocking (max 2 mocks per test)**

## Common Fixes

### Renaming Files

```bash
# Rename .spec.ts to .e2e.ts and move to E2E folder
mv src/ui.spec.ts apps/e2e/tests/ui.e2e.ts

# Rename .int.test.ts to .test.ts and move to integration/
mv src/api.int.test.ts src/integration/api.test.ts

# Simple rename for unit tests
mv src/calc.unit.test.ts src/calc.test.ts
```

### Converting to E2E

```typescript
// DELETE this component test
test("Button renders", () => {
  render(<Button />);
});

// ADD this E2E test instead
test("user clicks button to save", async ({ page }) => {
  await page.click('[data-testid="save-button"]');
  await expect(page.locator('[data-testid="saved-message"]')).toBeVisible();
});
```

---

_Use this prompt regularly to ensure testing practices follow the simplified
Atomiton testing philosophy_
