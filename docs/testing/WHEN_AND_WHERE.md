# Testing Strategy: When & Where to Write Tests

> **Core Principle**: Test at the highest level that makes sense. If you can test it via E2E, do that. Only drop down to lower levels when E2E isn't practical.

## Test Location & Naming (Simplified)

### File Naming Convention - Only 2 Types

```
*.test.ts   - Unit/integration/contract/benchmark tests (co-located)
*.e2e.ts    - E2E Playwright tests (in apps/e2e)
```

That's it. No more `.int.test.ts`, `.smoke.test.ts`, `.bench.test.ts`, `.spec.ts`. The folder structure tells us what kind of test it is.

### Folder Structure

```
atomiton/
├── apps/
│   ├── e2e/
│   │   └── tests/           # All E2E tests (*.e2e.ts)
│   │       ├── critical/    # Must-work user journeys
│   │       └── workflows/   # Complex user workflows
│   ├── client/
│   │   └── src/
│   │       ├── integration/ # Client-specific integration tests
│   │       └── [file].test.ts  # Co-located unit tests (rare)
│   └── desktop/
│       └── src/
│           ├── integration/ # Desktop-specific integration tests
│           └── [file].test.ts  # Co-located unit tests (rare)
└── packages/
    └── @atomiton/[package]/
        └── src/
            ├── integration/ # Package integration tests
            └── [file].test.ts  # Co-located unit tests
```

## Decision Framework: Where to Test What

### 1. Desktop/Electron Features → E2E Tests ONLY

**Why**: Your experience proved this - testing Electron without UI is painful and not realistic.

```typescript
// ✅ CORRECT - E2E test with real Electron + UI
// apps/e2e/tests/desktop-features.e2e.ts
test("desktop app saves files locally", async () => {
  const app = await electron.launch({
    args: ["path/to/desktop/main.js"]
  });
  const window = await app.firstWindow();
  
  // Test through real UI interactions
  await window.click('[data-testid="save-button"]');
  // Verify file was saved
});

// ❌ WRONG - Don't try to test Electron without UI
// This is what you tried and found challenging
```

### 2. UI Interactions → E2E Tests

**Why**: Testing UI without a browser is testing implementation, not behavior.

```typescript
// ✅ CORRECT - E2E test
// apps/e2e/tests/editor-workflow.e2e.ts
test("user creates node connection", async ({ page }) => {
  await page.dragAndDrop(
    '[data-testid="node-output"]',
    '[data-testid="node-input"]'
  );
  await expect(page.locator('[data-testid="connection"]')).toBeVisible();
});

// ❌ WRONG - Don't unit test React components
```

### 3. Data Transformations → Integration Tests

**Why**: These are pure data pipelines that don't need UI or Electron.

```typescript
// ✅ CORRECT - Integration test for data pipeline
// packages/@atomiton/yaml/src/integration/transform.test.ts
test("YAML to JSON transformation pipeline", () => {
  const yaml = loadYamlFile("template.yaml");
  const json = transformToJson(yaml);
  expect(json.nodes).toHaveLength(3);
});
```

### 4. Complex Algorithms → Unit Tests (Co-located)

**Why**: Pure functions with complex logic benefit from fast, focused tests.

```typescript
// ✅ CORRECT - Unit test for complex pure function
// packages/@atomiton/editor/src/utils/layout.test.ts
test("calculateNodeLayout handles circular graphs", () => {
  const result = calculateNodeLayout(circularGraph);
  expect(result.positions).toBeDefined();
  expect(result.error).toBeNull();
});
```

### 5. Package Public APIs → Integration Tests

**Why**: Ensure package contracts remain stable.

```typescript
// ✅ CORRECT - Integration test for package API
// packages/@atomiton/conductor/src/integration/api.test.ts
test("conductor executes workflow with all node types", async () => {
  const result = await conductor.execute(fullWorkflow);
  expect(result.status).toBe("success");
});
```

## What Goes Where: Specific Examples

### E2E Tests (apps/e2e/tests/)

Test these through real user interactions:
- **Electron/Desktop features**: File system, native menus, IPC
- **User workflows**: Template → Editor → Save → Load
- **Canvas interactions**: Pan, zoom, node creation, connections
- **Cross-window communication**: Multiple windows, deep links
- **Persistence**: Settings, recent files, workspace state

### Integration Tests (src/integration/)

Test these as data pipelines without UI:
- **Package APIs**: Public methods and contracts
- **Data transformations**: YAML→JSON, validation, parsing
- **Store operations**: State management (without UI)
- **Factory functions**: Node creation, composite assembly
- **IPC message handling**: Message serialization/deserialization

### Unit Tests (co-located *.test.ts)

Only test these as isolated units:
- **Complex algorithms**: Graph algorithms, layout calculations
- **Pure utilities**: Date formatting, ID generation, deep merge
- **Math functions**: Collision detection, position calculations
- **Parsers**: Custom parsing logic (not the full pipeline)

## What NOT to Test

### Never Write Tests For:
- **React component rendering**: Test through E2E instead
- **Electron main process alone**: Test through E2E with renderer
- **Mocked IPC communication**: Test real IPC through E2E
- **Redux/Store actions**: Test store behavior through integration
- **Simple prop passing**: Not worth testing

## Real Examples from Atomiton

### ✅ Good: E2E for Desktop Features

```typescript
// apps/e2e/tests/desktop-persistence.e2e.ts
test("workspace persists between app restarts", async () => {
  // Launch real app
  const app1 = await electron.launch({ args: [DESKTOP_PATH] });
  const window1 = await app1.firstWindow();
  
  // Create workflow through UI
  await window1.click('[data-testid="new-workflow"]');
  await window1.fill('[data-testid="workflow-name"]', "My Workflow");
  await window1.click('[data-testid="save"]');
  await app1.close();
  
  // Relaunch and verify persistence
  const app2 = await electron.launch({ args: [DESKTOP_PATH] });
  const window2 = await app2.firstWindow();
  await expect(window2.locator('[data-testid="workflow-name"]')).toContainText("My Workflow");
  await app2.close();
});
```

### ✅ Good: Integration for Data Pipeline

```typescript
// packages/@atomiton/nodes/src/integration/composite.test.ts
test("composite node factory pipeline", () => {
  const yamlTemplate = fs.readFileSync("hello-world.yaml", "utf-8");
  const parsed = fromYaml(yamlTemplate);
  const composite = createCompositeNode(parsed.data);
  
  expect(composite.nodes).toHaveLength(3);
  expect(composite.edges).toHaveLength(2);
  expect(composite.validate()).toBe(true);
});
```

### ❌ Bad: Testing Electron Without UI

```typescript
// DON'T DO THIS - This is what you found challenging
test("electron IPC without UI", async () => {
  // Trying to test IPC directly is painful
  const mainProcess = await setupElectronMain();
  const result = await mainProcess.handle("save-file", data);
  // This doesn't reflect real usage
});
```

## Migration Path

### From Current Tests:

1. **Find all `.spec.ts`, `.int.test.ts`, `.smoke.test.ts`, `.bench.test.ts` files**
   ```bash
   find . -name "*.spec.ts" -o -name "*.int.test.ts" -o -name "*.smoke.test.ts" -o -name "*.bench.test.ts"
   ```

2. **Rename based on type**
   ```bash
   # E2E tests (formerly .spec.ts) become .e2e.ts
   mv src/foo.spec.ts apps/e2e/tests/foo.e2e.ts
   
   # Integration tests go in integration/ folder
   mv src/foo.int.test.ts src/integration/foo.test.ts
   
   # Smoke tests likely become E2E tests
   mv src/bar.smoke.test.ts apps/e2e/tests/bar.e2e.ts
   ```

3. **Update test scripts in package.json**
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:integration": "vitest run src/integration",
       "test:e2e": "playwright test",
       "test:watch": "vitest watch"
     }
   }
   ```

## Quick Decision Guide

```
Is it testing Electron/Desktop features?
  → E2E test (apps/e2e/tests/*.e2e.ts)

Is it testing UI interactions?
  → E2E test (apps/e2e/tests/*.e2e.ts)

Is it testing data transformation or package APIs?
  → Integration test (src/integration/*.test.ts)

Is it a complex pure function?
  → Unit test (src/[file].test.ts - co-located)

Still unsure?
  → Try E2E first. Only drop down if it's too slow/complex.
```

## Summary

- **2 file extensions only**: `.test.ts` (unit/integration) and `.e2e.ts` (E2E)
- **Folder structure determines test type**, not file naming
- **E2E for anything involving Electron or UI** (your experience proved this)
- **Integration for data pipelines and APIs**
- **Unit tests only for complex pure functions**
- **When in doubt, test at the highest level possible**

This approach is simpler, clearer, and aligns with what you learned from trying to test Electron without UI - just test it the way users use it!

---

**Last Updated**: 2025-01-17
**Status**: Active strategy based on real experience