# Testing Philosophy - Atomiton

## Core Principle: Test Like Users Use

We test how users actually interact with our system, not implementation details.

## Testing Pyramid (Inverted)

```
┌─────────────────────────────────┐
│   Playwright E2E Tests (60%)    │ ← User flows, real interactions
├─────────────────────────────────┤
│  API Contract Tests (30%)       │ ← Package personas, public APIs
├─────────────────────────────────┤
│   Unit Tests (10%)              │ ← Pure functions, critical logic
└─────────────────────────────────┘
```

## Test Types & When to Use Them

### 1. 🎭 Playwright E2E Tests (Primary)

**Use For:**

- All user workflows
- Feature functionality
- Integration between systems
- Smoke tests for CI/CD
- Visual regression (snapshots) for design system

**Example:**

```typescript
test("user can create a workflow", async ({ page }) => {
  // Real user actions
  await page.click("text=Add Node");
  await page.dragAndDrop(".node", ".canvas");
  await expect(page.locator(".node-on-canvas")).toBeVisible();
});
```

**Benefits:**

- Tests actual user experience
- Catches real bugs users would hit
- No mocking = high confidence
- Fast enough for pre-push hooks

### 2. 📦 API Contract Tests (Package Personas)

**Use For:**

- Public package APIs
- Ensuring backwards compatibility
- Package integration points
- Developer experience testing

**Example:**

```typescript
test("editor package exposes correct API", () => {
  const editor = require("@atomiton/editor");

  // Test the contract we promise
  expect(editor).toHaveProperty("Canvas");
  expect(editor).toHaveProperty("useNodes");
  expect(typeof editor.Canvas).toBe("function");
});
```

**Benefits:**

- Protects package consumers
- Documents expected API
- Prevents breaking changes
- Acts like "E2E for packages"

### 3. 🔧 Unit Tests (Minimal)

**Use For:**

- Pure functions with complex logic
- Critical algorithms
- Data transformations
- Error handling edge cases

**Example:**

```typescript
test("calculateNodePosition handles edge cases", () => {
  expect(calculateNodePosition(null)).toEqual({ x: 0, y: 0 });
  expect(calculateNodePosition({ x: -100 })).toEqual({ x: 0, y: 0 });
});
```

**Benefits:**

- Fast feedback for logic bugs
- Good for TDD of algorithms
- Documents edge cases

## What We DON'T Test

### ❌ Component Unit Tests

**Why Not:**

- Not how users interact
- High maintenance, low value
- Playwright E2E covers actual usage
- Testing implementation, not behavior

**Instead of:**

```typescript
// DON'T DO THIS
test('Button component renders with props', () => {
  const { getByText } = render(<Button label="Click" />);
  expect(getByText('Click')).toBeInTheDocument();
});
```

**Do This:**

```typescript
// DO THIS
test("user can click button to submit form", async ({ page }) => {
  await page.click('button:has-text("Submit")');
  await expect(page.locator(".success-message")).toBeVisible();
});
```

### ❌ Mocked Integration Tests

**Why Not:**

- Mocks lie about reality
- False confidence
- Real integration issues missed

## Testing Strategy by Package Type

### Application Packages (apps/\*)

- **Primary**: Playwright E2E
- **Secondary**: Critical path unit tests
- **Skip**: Component unit tests

### UI Packages (@atomiton/ui)

- **Primary**: Playwright visual snapshots
- **Secondary**: Storybook for development
- **Skip**: Component unit tests

### Logic Packages (@atomiton/core, @atomiton/nodes)

- **Primary**: API contract tests
- **Secondary**: Logic unit tests
- **Skip**: Internal implementation tests

### Utility Packages (@atomiton/events, @atomiton/store)

- **Primary**: API contract tests
- **Secondary**: Behavior tests
- **Skip**: Private method tests

## Pre-commit/Push Strategy

### Pre-commit (Fast)

- Run tests for changed package only
- Bail on first failure
- No coverage collection
- ~10 seconds max

### Pre-push (Thorough)

- Run Playwright smoke tests
- Test critical user paths
- ~30 seconds max

### CI/CD (Complete)

- Full Playwright suite
- All package tests
- Visual regression checks
- Performance benchmarks

## Key Principles

1. **Test behavior, not implementation**
2. **If it's not user-facing, question if it needs testing**
3. **One E2E test is worth 10 unit tests**
4. **Snapshots for design system only**
5. **Fast tests get run, slow tests get skipped**
6. **Real > Mocked every time**

## Practical Examples

### Good Test

```typescript
// Tests actual user value
test("user can save and reload their work", async ({ page }) => {
  await createWorkflow(page);
  await page.click('button:has-text("Save")');
  await page.reload();
  await expect(page.locator(".workflow")).toBeVisible();
});
```

### Bad Test

```typescript
// Tests implementation details
test("useState hook updates state", () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1));
  expect(result.current[0]).toBe(1);
});
```

## Metrics That Matter

- **User flows working**: 100%
- **API contracts stable**: 100%
- **Test execution time**: <30s for smoke
- **False positives**: Near zero
- **Test maintenance burden**: Minimal

## Summary

> "If a user wouldn't notice it breaking, don't test it.
> If a developer would curse you for breaking it, test the contract.
> Everything else is optional."

---

**Last Updated**: 2025-09-11
**Philosophy Owner**: Engineering Team
