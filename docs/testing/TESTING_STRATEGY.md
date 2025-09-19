# Testing Strategy for Atomiton Monorepo

## Executive Summary

This document defines the testing strategy for the Atomiton monorepo, emphasizing test isolation, speed, and reliability. We follow a "Testing Trophy" approach rather than the traditional pyramid, with clear boundaries between test types and no shared mock utilities to maintain test integrity.

## Core Principles

### 1. Test Independence

- **No build dependencies** for unit and smoke tests
- **Mock at boundaries** rather than using shared mock utilities
- **Source code testing** - tests run against TypeScript directly, not compiled output

### 2. Test Integrity Over Convenience

- **No exported test utilities** from packages to avoid "mock drift"
- **Contract testing** at package boundaries
- **Real implementations** in integration tests

### 3. Speed Through Isolation

- **Smoke tests**: <10 seconds total
- **Unit tests**: Milliseconds per test
- **Integration tests**: Seconds per suite
- **E2E tests**: Minutes for full workflows

## Test Categories

### Smoke Tests

**Purpose**: Verify the code doesn't "catch fire" when started

**Characteristics**:

- Self-contained and independent
- No external dependencies or builds required
- Execute in <10 seconds total
- Answer: "Does this code even initialize?"

**Implementation**:

```typescript
// ✅ Good - Fast, isolated check
describe("Storage Smoke Tests", () => {
  it("should create storage instance", () => {
    const storage = createStorage({ engine: "memory" });
    expect(storage).toBeDefined();
    expect(storage.load).toBeTypeOf("function");
  });
});

// ❌ Bad - Requires built dependencies
import { createStorage } from "@atomiton/storage"; // Needs build
```

**Turbo Configuration**:

```json
"test:smoke": {
  "dependsOn": [],  // No dependencies!
  "cache": false,
  "env": ["NODE_ENV", "CI"]
}
```

### Unit Tests

**Purpose**: Test individual functions, classes, and modules in isolation

**Characteristics**:

- Mock all external dependencies
- Test source code directly
- No package builds required
- Focus on input/output behavior

**Implementation**:

```typescript
// Mock at import boundary
vi.mock("@atomiton/storage/desktop", () => ({
  createStorage: vi.fn(() => ({
    load: vi.fn().mockResolvedValue({}),
    save: vi.fn().mockResolvedValue(void 0),
  })),
}));

describe("Conductor Unit Tests", () => {
  it("should initialize with storage", () => {
    const conductor = createConductor({ storage: mockStorage });
    expect(conductor).toBeDefined();
  });
});
```

**Turbo Configuration**:

```json
"test:unit": {
  "dependsOn": [],  // No dependencies!
  "outputs": ["coverage/**"],
  "env": ["NODE_ENV", "CI"]
}
```

### Integration Tests

**Purpose**: Test interactions between modules and packages

**Characteristics**:

- Use real implementations with test configurations
- May require builds for cross-package testing
- Test contract adherence between packages
- Use in-memory or test-mode configurations

**Implementation**:

```typescript
// Use real implementations, not mocks
import { createStorage } from "@atomiton/storage/desktop";
import { createConductor } from "@atomiton/conductor/desktop";

describe("Storage-Conductor Integration", () => {
  it("should persist execution state", async () => {
    // Real storage with in-memory engine
    const storage = createStorage({ engine: "memory" });
    const conductor = createConductor({ storage });

    await conductor.execute(testComposite);
    const saved = await storage.load("executions");
    expect(saved).toBeDefined();
  });
});
```

**Turbo Configuration**:

```json
"test:integration": {
  "dependsOn": ["^build"],  // Needs built packages
  "cache": true,
  "env": ["NODE_ENV", "CI"]
}
```

### Contract Tests

**Purpose**: Verify that implementations satisfy their interfaces

**Characteristics**:

- Test multiple implementations against same interface
- Ensure API contracts are honored
- Catch breaking changes early

**Implementation**:

```typescript
describe("Storage Contract", () => {
  const implementations = [
    { name: "memory", create: () => createMemoryStorage() },
    {
      name: "filesystem",
      create: () => createFileSystemStorage({ dir: tmpDir }),
    },
  ];

  implementations.forEach(({ name, create }) => {
    describe(`${name} implementation`, () => {
      let storage: IStorage;

      beforeEach(() => {
        storage = create();
      });

      it("implements load/save/delete", async () => {
        await storage.save("test-key", { data: "test" });
        const loaded = await storage.load("test-key");
        expect(loaded).toEqual({ data: "test" });
        await storage.delete("test-key");
        const deleted = await storage.load("test-key");
        expect(deleted).toBeNull();
      });
    });
  });
});
```

### E2E Tests

**Purpose**: Test complete user workflows through the full stack

**Characteristics**:

- Require fully built applications
- Test real user interactions
- Slower but comprehensive
- Use tools like Playwright

**Implementation**:

```typescript
test("user can create and execute blueprint", async ({ page }) => {
  await page.goto("/editor");
  await page.click('[data-testid="add-node"]');
  await page.fill('[data-testid="node-config"]', "test-value");
  await page.click('[data-testid="execute"]');
  await expect(page.locator('[data-testid="result"]')).toContainText("Success");
});
```

**Turbo Configuration**:

```json
"test:e2e": {
  "dependsOn": ["build"],  // Needs built app
  "cache": false,
  "env": ["NODE_ENV", "CI", "PLAYWRIGHT_BASE_URL"]
}
```

## Testing Patterns

### Pattern 1: Mock at the Boundary

```typescript
// ✅ Good - Mock at import level
vi.mock("@atomiton/events/desktop");

// ❌ Bad - Import shared mocks
import { mockEventBus } from "@atomiton/events/testing";
```

### Pattern 2: Test Modes Over Mocks

```typescript
// ✅ Good - Real code with test behavior
export function createConductor(config: ConductorConfig) {
  return new Conductor({
    ...config,
    testMode: process.env.NODE_ENV === "test",
  });
}

// ❌ Bad - Exported mock factory
export function createMockConductor() {
  return { execute: vi.fn() };
}
```

### Pattern 3: In-Memory Implementations for Integration Tests

```typescript
// ✅ Good - Real implementation, test configuration
const storage = createStorage({ engine: "memory" });

// ❌ Bad - Mocked storage in integration test
const storage = createMockStorage();
```

## File Organization

```
packages/
  @atomiton/conductor/
    src/
      index.ts                 # Main exports
      conductor.ts             # Implementation
    __tests__/
      smoke/
        basic.smoke.test.ts   # <10s initialization tests
      unit/
        conductor.test.ts     # Isolated unit tests
      integration/
        storage.test.ts       # Cross-package tests
      contract/
        executor.test.ts      # Interface compliance
```

## Avoiding Common Pitfalls

### 1. Mock Drift

**Problem**: Shared mocks become outdated as APIs evolve
**Solution**: Mock at test level, not package level

### 2. Hidden Integration Issues

**Problem**: Over-mocking hides real problems
**Solution**: Use integration tests with real implementations

### 3. Slow Test Suites

**Problem**: Tests depend on builds
**Solution**: Remove build dependencies from unit/smoke tests

### 4. Flaky Tests

**Problem**: Tests depend on external services
**Solution**: Mock only external boundaries, use test modes

## Migration Strategy

1. **Remove build dependencies** from `test:unit` and `test:smoke` in `turbo.json`
2. **Delete shared test utilities** exports from packages
3. **Update tests to mock at boundaries**
4. **Add contract tests** for shared interfaces
5. **Create integration test suites** for cross-package interactions

## Performance Targets

| Test Type   | Target Time              | Scope                |
| ----------- | ------------------------ | -------------------- |
| Smoke       | <10 seconds total        | All packages         |
| Unit        | <1ms per test            | Individual functions |
| Integration | <100ms per test          | Package interactions |
| Contract    | <50ms per implementation | Interface compliance |
| E2E         | <30 seconds per workflow | Full user journeys   |

## Tooling Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    clearMocks: true, // Clear mock history between tests
    mockReset: true, // Reset mock implementations
    restoreMocks: true, // Restore original implementations
    include: ["**/*.test.ts", "**/*.smoke.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.integration.test.ts", // Run separately
      "**/*.e2e.test.ts", // Run separately
    ],
  },
});
```

### TypeScript Configuration for Tests

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"],
    "lib": ["es2022"],
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "bundler"
  }
}
```

## Monitoring and Metrics

Track these metrics to ensure testing health:

1. **Test execution time** - Should decrease over time
2. **Test flakiness rate** - Should be <1%
3. **Coverage** - Aim for >80% for critical paths
4. **Mock usage** - Should decrease as we add integration tests
5. **Build dependency count** - Should be minimal

## Review Checklist

When reviewing tests, ensure:

- [ ] Smoke tests have no build dependencies
- [ ] Unit tests mock at boundaries, not with shared utilities
- [ ] Integration tests use real implementations
- [ ] Contract tests verify all implementations
- [ ] E2E tests cover critical user paths
- [ ] No exported test utilities from packages
- [ ] Tests run against source code, not builds
- [ ] Mock cleanup is configured properly

---

_Last Updated: 2024-01-19_
_Next Review: 2024-02-19_
