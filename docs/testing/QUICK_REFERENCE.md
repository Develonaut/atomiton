# Testing Quick Reference

## Test Priority

```
E2E (60%) > Integration (30%) > Unit (10%)
```

## Decision Tree

```
Is it Electron/Desktop feature OR UI interaction?
  YES → E2E test (apps/e2e/tests/*.e2e.ts)
  NO ↓

Is it a data pipeline OR package API?
  YES → Integration test (src/integration/*.test.ts)
  NO ↓

Is it a complex pure function?
  YES → Unit test (src/[file].test.ts - co-located)
  NO → Don't test it
```

## File Naming (Only 2 Types!)

```
*.test.ts   - Unit/Integration (folder tells you which)
*.e2e.ts    - E2E Playwright tests
```

That's it. No more `.int.test.ts`, `.smoke.test.ts`, `.bench.test.ts`, `.spec.ts`

## Folder Structure

```
apps/e2e/tests/           # All E2E tests (*.e2e.ts)
src/integration/          # Integration tests (*.test.ts)  
src/[file].test.ts       # Co-located unit tests (*.test.ts)
```

## Commands

```bash
# Run tests
pnpm test                    # Run unit tests
pnpm test:integration        # Run integration tests  
pnpm test:e2e               # Run E2E tests
pnpm test:e2e --headed      # See browser while testing

# Debug
pnpm test:watch             # Watch mode
pnpm test:e2e --debug       # Debug E2E tests
pnpm test:speed-check       # Find slow tests
```

## Writing Tests

### E2E Test (User Journey)
```typescript
// apps/e2e/tests/workflow.e2e.ts
test("user creates workflow", async ({ page }) => {
  await page.click('[data-testid="create-button"]');
  await expect(page.locator('[data-testid="editor-canvas"]')).toBeVisible();
});
```

### Integration Test (API/Pipeline)
```typescript
// src/integration/transform.test.ts
test("factory pipeline transforms data correctly", () => {
  const result = processWorkflow(validInput);
  expect(result).toMatchObject({ status: "success" });
});
```

### Unit Test (Pure Function)
```typescript
// src/utils/calculate.test.ts (co-located)
test("calculatePosition handles edge cases", () => {
  const result = calculatePosition(nodes, 20);
  expect(result.x % 20).toBe(0);
});
```

## Test IDs (Required)

```html
<button data-testid="submit-button">Submit</button>
```

Pattern: `[context]-[element]-[variant]`
- `editor-canvas`
- `node-properties-panel`
- `template-button-hello-world`

## Speed Limits

| Type | Limit | Blocks |
|------|-------|--------|
| Unit | <100ms | Never |
| Integration | <10s/package | Pre-commit |
| E2E | <60s/journey | Pre-push |

## What NOT to Test

❌ Component props  
❌ Mocked everything  
❌ Implementation details  
❌ Framework behavior  
❌ Simple getters/setters  
❌ Electron without UI (use E2E instead)

## Quick Rules

1. **Electron/Desktop?** → Always E2E
2. **UI interaction?** → Always E2E  
3. **Data transformation?** → Integration
4. **Complex algorithm?** → Unit
5. **When unsure?** → Try E2E first

---

Full docs: [README.md](./README.md)  
Where to test what: [WHEN_AND_WHERE.md](./WHEN_AND_WHERE.md)