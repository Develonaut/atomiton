# Atomiton Testing Strategy

> **Core Philosophy: Test user journeys, not implementation details**

We follow a testing approach similar to Bluesky - prioritizing integration and
end-to-end tests that validate complete user workflows over unit tests. This
allows us to move fast while protecting critical user journeys.

## Testing Pyramid (Inverted)

```
┌─────────────────────────────────┐
│    E2E Tests (60%)              │ ← Complete user journeys
├─────────────────────────────────┤
│    Integration Tests (30%)       │ ← Component interactions
├─────────────────────────────────┤
│    Unit Tests (10%)             │ ← Pure logic only
└─────────────────────────────────┘
```

## What We Test vs What We Don't

### ✅ Test These

- **User workflows** - Complete journeys from start to finish
- **API contracts** - Package interfaces remain stable
- **Factory pipelines** - Data transformation workflows
- **Critical algorithms** - Complex pure functions
- **Error recovery** - Graceful degradation

### ❌ Don't Test These

- Component props/rendering
- Implementation details
- Mocked integrations
- Simple getters/setters
- Framework behavior

## Test Categories & When to Use Them

### 1. E2E Tests (Primary Focus) - Playwright

**Purpose**: Validate complete user workflows in real browser/Electron
environment  
**Location**: `apps/e2e/tests/`  
**File Extension**: `*.spec.ts`  
**Speed Target**: <60 seconds per journey  
**Run When**: Pre-push, CI/CD

#### Critical User Journeys We Test

```typescript
// Example: Gallery to Editor Flow
test("user creates blueprint from template", async ({ page }) => {
  // Real user actions in real environment
  await page.goto("/");
  await page.click('[data-testid="template-button-hello-world"]');
  await page.waitForURL(/\/editor\//);

  // Verify the complete journey worked
  const canvas = page.locator('[data-testid="editor-canvas"]');
  await expect(canvas).toBeVisible();

  const nodes = await page.locator('[data-testid^="node-"]').count();
  expect(nodes).toBeGreaterThan(0);
});
```

**When to Use E2E:**

- Testing Electron/Desktop features (file system, native menus, IPC)
- UI interactions (clicks, drags, form inputs)
- Complete user workflows
- Cross-window communication
- Application persistence

### 2. Integration Tests - Vitest

**Purpose**: Test component interactions and package contracts  
**Location**: `src/integration/` folders  
**File Extension**: `*.test.ts`  
**Speed Target**: <10 seconds total per package  
**Run When**: Pre-commit (changed packages only)

#### What We Integration Test

```typescript
// Example: Factory Pipeline Testing
import { fromYaml } from "../transform/fromYaml";
import templateYaml from "./hello-world.yaml?raw";

test("factory pipeline transforms YAML to executable JSON", () => {
  const result = fromYaml(templateYaml);

  // Test the actual transformation pipeline
  expect(result.data).toHaveProperty("nodes");
  expect(result.data).toHaveProperty("edges");
  expect(result.data.nodes[0].type).toBe("code");
});
```

**When to Use Integration:**

- Package public APIs
- Data transformation pipelines
- Store operations (without UI)
- Factory functions
- Message serialization

### 3. Unit Tests (Minimal)

**Purpose**: Test pure functions and critical algorithms only  
**Location**: Co-located with source  
**File Extension**: `*.test.ts`  
**Speed Target**: <100ms each  
**Run When**: Always (they're fast)

#### When to Write Unit Tests

```typescript
// ✅ GOOD - Complex pure function
export function calculateNodePosition(
  nodes: Node[],
  gridSize: number,
): Position {
  // Complex algorithm here
}

// Test it
test("calculateNodePosition handles overlapping nodes", () => {
  const result = calculateNodePosition(overlappingNodes, 20);
  expect(result.x % 20).toBe(0);
  expect(result.y % 20).toBe(0);
});
```

**When to Use Unit:**

- Complex algorithms (graph algorithms, layout calculations)
- Pure utility functions with complex logic
- Math functions
- Custom parsers

## Test Organization & Naming

### Simplified File Naming - Only 2 Types

```
*.test.ts   - Unit/Integration tests (folder determines type)
*.spec.ts   - E2E Playwright tests (always in apps/e2e/tests/)
```

**No more**: `.int.test.ts`, `.smoke.test.ts`, `.bench.test.ts`,
`.e2e.test.ts`  
The folder structure tells us what type of test it is.

### Directory Structure

```
atomiton/
├── apps/
│   ├── e2e/
│   │   └── tests/                  # All E2E tests (*.spec.ts)
│   │       ├── critical/           # Must-work user journeys
│   │       └── workflows/          # Complex user workflows
│   ├── client/src/
│   │   ├── integration/            # Client integration tests
│   │   └── [file].test.ts          # Co-located unit tests (rare)
│   └── desktop/src/
│       ├── integration/            # Desktop integration tests
│       └── [file].test.ts          # Co-located unit tests (rare)
└── packages/@atomiton/[package]/src/
    ├── integration/                 # Package integration tests
    └── [file].test.ts              # Co-located unit tests (minimal)
```

For detailed guidance on where to write specific types of tests, see
[WHEN_AND_WHERE.md](./WHEN_AND_WHERE.md).

## Test Identification (Required)

All interactive elements MUST have `data-testid` attributes:

```typescript
// Component
<button data-testid="create-blueprint-button">
  Create Blueprint
</button>

// Test
await page.click('[data-testid="create-blueprint-button"]');
```

### Naming Convention

Use kebab-case with clear hierarchy:

```
[context]-[element]-[variant]

Examples:
- data-testid="editor-canvas"
- data-testid="node-properties-panel"
- data-testid="template-button-hello-world"
- data-testid="node-code-${nodeId}"
```

## Test Scripts (Required for All Packages)

Every package must have these scripts:

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

Apps additionally have:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## Speed Requirements & Performance

### Test Execution Limits

| Test Type   | Time Limit         | When Blocked               |
| ----------- | ------------------ | -------------------------- |
| Unit        | <100ms each        | Never (too fast to matter) |
| Integration | <10s total/package | Pre-commit                 |
| E2E         | <60s per journey   | Pre-push                   |

### Monitoring Test Speed

```bash
# Check which tests are slow
pnpm test:speed-check

# View test performance dashboard
pnpm test:dashboard
```

## Edge Cases & Failure Scenarios

### Priority Edge Cases to Test

```typescript
// Composite Node Edge Cases
describe("Composite node failure handling", () => {
  test("handles timeout in long-running nodes", async () => {
    const result = await executeWithTimeout(longRunningNode, 5000);
    expect(result.error).toContain("timeout");
  });

  test("propagates errors through workflow", async () => {
    const result = await executeWorkflow(workflowWithFailingNode);
    expect(result.status).toBe("partial_failure");
    expect(result.completedNodes).toHaveLength(2);
  });

  test("detects circular dependencies", () => {
    const result = validateWorkflow(circularWorkflow);
    expect(result.errors).toContain("circular dependency");
  });
});
```

## Pre-commit & CI/CD Hooks

### Pre-commit (<5 seconds)

- Integration tests for changed packages only
- Bail on first failure

### Pre-push (<60 seconds)

- Critical E2E user journeys
- All integration tests for changed packages

### CI/CD Pipeline

- Full E2E suite
- All integration tests
- Performance benchmarks
- Coverage reports

## Testing Specific Features

### Desktop/Electron → Always E2E

```typescript
// ✅ CORRECT - Test Electron through real UI
test("desktop app saves files locally", async () => {
  const app = await electron.launch({
    args: ["path/to/desktop/main.js"],
  });
  const window = await app.firstWindow();

  await window.click('[data-testid="save-button"]');
  // Verify through UI that file was saved
});

// ❌ WRONG - Don't test Electron without UI
// (This is what proved challenging in practice)
```

### Data Pipelines → Integration Tests

```typescript
test("complete factory pipeline for composite nodes", async () => {
  // Test the data transformation without UI
  const parsed = fromYaml(templateYaml);
  const composite = createCompositeNode(parsed.data);

  expect(composite.nodes).toHaveLength(3);
  expect(composite.validate()).toBe(true);
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ BAD - Testing implementation
test("calls setState with new value", () => {
  // Testing internals
});

// ✅ GOOD - Testing behavior
test("updates display when user types", async () => {
  await user.type(input, "Hello");
  expect(display).toHaveText("Hello");
});
```

### 2. Use Real Data & Environments

```typescript
// ❌ BAD - Mocking everything
vi.mock("../api");
vi.mock("../store");

// ✅ GOOD - Real implementations
test("workflow executes with real conductor", async () => {
  const result = await conductor.execute(realWorkflow);
  expect(result).toBeDefined();
});
```

### 3. Clear Test Names

```typescript
// Using describe/it pattern consistently
describe("Workflow execution", () => {
  it("completes simple workflow successfully", () => {});
  it("handles node failures gracefully", () => {});
  it("respects timeout limits", () => {});
});
```

### 4. When in Doubt, Go Higher Level

If you're unsure whether to write a unit, integration, or E2E test, **start with
E2E**. Only drop down to lower levels if E2E is impractical due to speed or
complexity.

## Debugging Tests

### Playwright

```bash
# Run headed (see browser)
pnpm test:e2e --headed

# Debug specific test
pnpm test:e2e --debug user-journey

# Generate trace for failures
pnpm test:e2e --trace on
```

### Vitest

```bash
# Run specific file
pnpm test integration/workflow.test.ts

# Watch mode for development
pnpm test:watch

# Debug with inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs
```

## Common Problems & Solutions

### "Tests are too slow"

1. Check if you're testing implementation instead of behavior
2. Use `test.concurrent()` for independent tests
3. Profile with `pnpm test:speed-check`

### "Tests are flaky"

1. Remove arbitrary waits, use proper assertions
2. Ensure proper test isolation
3. Use `data-testid` instead of complex selectors

### "Too many test files"

1. Follow inverted pyramid - more E2E, fewer unit tests
2. Delete tests that test framework behavior
3. Consolidate to just `.test.ts` and `.spec.ts`

## Success Metrics

- **Critical path coverage**: 100% of user journeys
- **Test execution time**: <60s for full E2E suite
- **False positive rate**: <1% of runs
- **Maintenance time**: <10% of dev time
- **Test file simplicity**: Only 2 file extensions

## Summary

> "If it doesn't affect users, don't test it.  
> If users can't do it, we don't ship it.  
> Move fast with confidence by testing what matters."

This is our single source of truth for testing. When in doubt, test the user
journey at the highest level possible.

---

**Last Updated**: 2025-01-17  
**Status**: Active - Single source of truth for all testing
