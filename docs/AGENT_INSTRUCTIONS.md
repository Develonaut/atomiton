# Agent Instructions for Code Development

## Overview

This document provides specific instructions for AI agents working on the
Atomiton codebase. Follow these guidelines to ensure your code meets our quality
standards.

## Before Starting Any Task

1. **Read the guidelines:**
   - [Bento Box Principles](./BENTO_BOX_PRINCIPLES.md)
   - [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md)

2. **For testing work specifically:**
   - [Testing Strategy](./testing/README.md) - Complete testing philosophy
   - [When & Where to Test](./testing/WHEN_AND_WHERE.md) - Test placement guide
   - [Quick Reference](./testing/QUICK_REFERENCE.md) - Quick lookup

3. **Understand the context:**
   - Check existing patterns in the codebase
   - Review similar files for consistency
   - Verify you're in the correct package/directory

## Testing Requirements (CRITICAL)

### Simplified Testing Rules

**Only 2 file extensions allowed:**

- `*.test.ts` - Unit/Integration tests (folder determines type)
- `*.spec.ts` - E2E Playwright tests (ONLY in apps/e2e/tests/)

**BANNED file names:**

- ❌ Never use: `.int.test.ts`, `.smoke.test.ts`, `.bench.test.ts`,
  `.e2e.test.ts`, `.unit.test.ts`

### Test Placement Decision Tree

```
Is it Electron/Desktop feature OR UI interaction?
  YES → E2E test (apps/e2e/tests/*.spec.ts)
  NO ↓

Is it a data pipeline OR package API?
  YES → Integration test (src/integration/*.test.ts)
  NO ↓

Is it a complex pure function?
  YES → Unit test (src/[file].test.ts - co-located)
  NO → Don't write a test
```

### Testing Philosophy

- **60% E2E, 30% Integration, 10% Unit** (inverted pyramid)
- **Test user journeys, not implementation details**
- **Electron/Desktop = ALWAYS E2E** (never test without UI)
- **UI interactions = ALWAYS E2E** (no component unit tests)
- **When in doubt, go E2E**

## During Development

### Automatic Actions (Do Without Being Asked)

#### 1. Remove Redundant Comments

```typescript
// ❌ REMOVE THESE AUTOMATICALLY
// Set the user name
user.name = "John";

// Increment counter
counter++;

// Return the result
return result;
```

#### 2. Fix Type Safety

```typescript
// ❌ NEVER SUBMIT THIS
function process(data: any): any {
  return data;
}

// ✅ ALWAYS FIX TO THIS
function process<T>(data: T): T {
  return data;
}
```

#### 3. Break Up Large Files

If a file exceeds 500 lines:

1. Identify logical boundaries
2. Extract into separate modules
3. Create an index file for exports
4. Update imports

#### 4. Apply Bento Box Principles

- One file = one responsibility
- Group related utilities together
- Keep functions under 50 lines
- Ensure composability

### Required Checks Before Completion

Run these commands and fix ALL issues:

```bash
# Must all pass with zero errors/warnings
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

### Status Reporting Format

When completing work, report status like this:

```
✅ Type Safety: PASS - No any types found
✅ Lint: PASS - No errors or warnings
✅ Tests: PASS - All tests passing
✅ Build: PASS - Built successfully
✅ File Size: PASS - Largest file: 342 lines
✅ Comments: CLEANED - Removed 8 redundant comments
✅ Bento Box: COMPLIANT - Single responsibility maintained
✅ Test Naming: COMPLIANT - Only .test.ts and .spec.ts used
```

## Common Patterns to Follow

### File Organization

```
packages/@atomiton/[package]/
├── src/
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks
│   ├── integration/     # Integration tests (*.test.ts)
│   ├── utils/           # Utilities (organized by type)
│   │   ├── string/      # String utilities
│   │   ├── date/        # Date utilities
│   │   └── validation/  # Validators
│   ├── types/           # TypeScript types
│   └── index.ts         # Public API

apps/
├── e2e/
│   └── tests/           # All E2E tests (*.spec.ts)
├── client/src/
│   ├── integration/     # Client integration tests
│   └── [file].test.ts   # Co-located unit tests
└── desktop/src/
    ├── integration/     # Desktop integration tests
    └── [file].test.ts   # Co-located unit tests
```

### Export Pattern

```typescript
// src/utils/string/capitalize.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// src/utils/string/index.ts
export { capitalize } from "./capitalize";

// src/index.ts
export * from "./utils/string";
```

## Red Flags - Never Submit Code With These

1. **Any `any` types** - Fix immediately
2. **Files over 500 lines** - Break up first
3. **Functions over 50 lines** - Refactor first
4. **Unorganized utilities** - Group by purpose
5. **Redundant comments** - Remove all
6. **Commented-out code** - Delete it
7. **Wrong test file names** - Only .test.ts and .spec.ts allowed
8. **Component unit tests** - Convert to E2E
9. **Electron tests without UI** - Must be E2E
10. **Excessive mocking** - Use real implementations

## Working with Tests

### For E2E Tests (PRIMARY - 60%)

```typescript
// apps/e2e/tests/user-journey.spec.ts
test("user completes workflow", async ({ page }) => {
  // Test real user interactions
  await page.click('[data-testid="create-button"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

- Always use `data-testid` attributes
- Test complete user journeys
- Run in real browser environment
- No mocking of core functionality

### For Integration Tests (30%)

```typescript
// src/integration/pipeline.test.ts
test("data transformation pipeline", () => {
  const result = transformData(input);
  expect(result).toMatchSchema(outputSchema);
});
```

- Test data pipelines and transformations
- Test package public APIs
- Use real implementations
- Keep in `integration/` folders

### For Unit Tests (MINIMAL - 10%)

```typescript
// src/utils/calculate.test.ts (co-located)
test("complex algorithm handles edge case", () => {
  const result = complexCalculation(edgeCase);
  expect(result).toBe(expected);
});
```

- Only for complex pure functions
- Co-locate with source file
- No UI or framework testing
- Keep minimal

## Special Instructions

### For React Components

- **NO component unit tests** - Test via E2E instead
- Use functional components with hooks
- Implement proper memoization
- Ensure accessibility (ARIA labels, keyboard navigation)
- Add `data-testid` to all interactive elements

### For React Hooks

- **Hooks are contracts** - they orchestrate, not implement
- **Extract business logic to utils** - all logic in pure functions
- **Keep hooks under 50 lines** - if longer, extract more to utils
- **Utils must be testable** - without React testing library
- See [React Hooks Best Practices](./REACT_HOOKS_BEST_PRACTICES.md)

### For Node/Electron Packages

- **Electron features = E2E tests only** (never test without UI)
- Keep logic pure when possible
- Implement proper error handling
- Test through real user interactions
- Document public APIs

### For Build/Config Files

- Maintain consistency across packages
- Document any special configurations
- Keep dependencies minimal

## Completion Criteria

You may only mark work as complete when:

✅ All TypeScript types are properly defined (no `any`)  
✅ Zero lint errors or warnings  
✅ All tests pass  
✅ Build succeeds  
✅ No redundant comments  
✅ Files are under 500 lines  
✅ Functions are under 50 lines  
✅ Bento Box principles followed  
✅ Test files use only `.test.ts` or `.spec.ts`  
✅ E2E tests for UI/Electron features  
✅ No component unit tests  
✅ Tests in correct locations  
✅ Proper error handling implemented

## Example Workflow

```bash
# 1. Make changes
# ... your code changes ...

# 2. Check test file naming
find . -name "*.int.test.ts" -o -name "*.smoke.test.ts" # Should return nothing

# 3. Check and fix
pnpm lint:fix        # Auto-fix what's possible
pnpm typecheck       # Verify types
pnpm test           # Run tests
pnpm build          # Verify build

# 4. Review your own changes
# - Remove redundant comments
# - Check file sizes
# - Verify test placement
# - Ensure only .test.ts and .spec.ts files

# 5. Run final verification
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# 6. Report completion with status
```

## Testing Compliance Review

Periodically verify testing compliance using:

- [TESTING_REVIEW_PROMPT](./testing/TESTING_REVIEW_PROMPT.md) - Run
  comprehensive audit

## Remember

**Quality over speed.** It's better to take time to do it right than to submit
code that needs multiple rounds of fixes.

**Test at the highest level possible.** E2E > Integration > Unit. When in doubt,
write an E2E test.

When in doubt, refer to:

- [Testing Strategy](./testing/README.md)
- [When & Where to Test](./testing/WHEN_AND_WHERE.md)
- [Bento Box Principles](./BENTO_BOX_PRINCIPLES.md)
- [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md)
- [Review Checklist](./REVIEW_CHECKLIST.md)
