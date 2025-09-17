# Testing Strategy - Atomiton Platform

## Overview

Atomiton implements a comprehensive testing strategy designed to ensure reliability, performance, and maintainability across the entire Blueprint automation platform. This strategy covers unit testing, integration testing, end-to-end testing, and performance benchmarking across all packages and applications.

## Testing Philosophy

### Core Principles

**Pyramid-First Approach:**

- **Unit Tests (70%)**: Fast, isolated, comprehensive coverage of business logic
- **Integration Tests (20%)**: Cross-component interactions and API contracts
- **E2E Tests (10%)**: Critical user journeys and system-wide workflows

**Quality Gates:**

- All tests must pass before merge
- Code coverage minimum 80% for new code
- Performance benchmarks must not regress >10%
- Smoke tests complete in <5 seconds per package

### Testing Standards

**Test Quality Requirements:**

- Tests are deterministic and repeatable
- No external dependencies in unit tests
- Descriptive test names following Given-When-Then pattern
- Appropriate use of mocking and stubbing
- Clean test data setup and teardown

## Testing Approach by Layer

### Unit Testing

**Scope and Coverage:**

- Pure functions and business logic
- Component behavior in isolation
- Edge cases and error conditions
- Input validation and data transformation

**Technologies:**

- **Vitest**: Primary test runner for TypeScript/JavaScript
- **@testing-library/react**: React component testing
- **MSW (Mock Service Worker)**: API mocking
- **vi.fn()**: Function mocking and spying

**Unit Test Structure:**

```typescript
// Example: Node parameter validation
describe("NodeParameterValidator", () => {
  describe("Given a CSV reader node", () => {
    it("When file path is missing, Then validation fails with specific error", () => {
      // Arrange
      const validator = new NodeParameterValidator();
      const parameters = { headers: true }; // Missing file path

      // Act
      const result = validator.validate("csv-reader", parameters);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("File path is required");
    });
  });
});
```

### Integration Testing

**Cross-Component Testing:**

- Node execution engine with storage layer
- UI components with state management
- API endpoints with authentication middleware
- Event system with subscribers

**Integration Test Patterns:**

```typescript
// Example: Blueprint execution integration
describe("Blueprint Execution Integration", () => {
  it("Should execute multi-node Blueprint and persist results", async () => {
    // Arrange: Create Blueprint with CSV → Transform → Database nodes
    const blueprint = createTestBlueprint();
    const executor = new BlueprintExecutor(storage, eventBus);

    // Act: Execute Blueprint
    const execution = await executor.execute(blueprint);

    // Assert: Verify execution state and side effects
    expect(execution.status).toBe("completed");
    expect(await storage.exists(`execution-${execution.id}`)).toBe(true);
    expect(mockDatabase.insertedRecords.length).toBeGreaterThan(0);
  });
});
```

### End-to-End Testing

**Critical User Flows:**

- Blueprint creation and editing workflow
- Node parameter configuration and validation
- Blueprint execution and monitoring
- User authentication and authorization
- File upload and processing workflows

**E2E Testing Tools:**

- **Playwright**: Cross-browser automation for web application
- **Electron Testing**: Custom testing for desktop application
- **API Testing**: REST and WebSocket endpoint validation

**E2E Test Structure:**

```typescript
// Example: Blueprint creation flow
test("User can create and execute a data processing Blueprint", async ({
  page,
}) => {
  // Given: User is logged in and on the Blueprint editor
  await page.goto("/editor");
  await page.waitForSelector('[data-testid="node-palette"]');

  // When: User creates a CSV processing workflow
  await dragNodeToCanvas(page, "csv-reader", { x: 100, y: 100 });
  await configureNode(page, "csv-reader", { file: "test-data.csv" });
  await dragNodeToCanvas(page, "data-transformer", { x: 300, y: 100 });
  await connectNodes(page, "csv-reader", "data-transformer");

  // And: User executes the Blueprint
  await page.click('[data-testid="execute-button"]');

  // Then: Execution completes successfully
  await page.waitForSelector('[data-testid="execution-success"]');
  const status = await page.textContent('[data-testid="execution-status"]');
  expect(status).toBe("Completed");
});
```

## Performance Testing

### Benchmarking Strategy

**Performance Metrics:**

- Node execution time per operation
- Blueprint compilation and loading time
- UI rendering performance and responsiveness
- Memory usage during large dataset processing
- Network latency for cloud storage operations

**Benchmark Implementation:**

```typescript
// Example: Node execution benchmark
import { bench, describe } from "vitest";

describe("CSV Reader Performance", () => {
  bench(
    "should process 10K rows within 500ms",
    async () => {
      const csvReader = new CsvReaderNode();
      const largeDataset = generateCsvData(10000);

      await csvReader.execute({
        parameters: { data: largeDataset, headers: true },
        inputs: {},
        context: createExecutionContext(),
      });
    },
    { time: 500 },
  );

  bench(
    "should handle 1M rows within 5 seconds",
    async () => {
      const csvReader = new CsvReaderNode();
      const massiveDataset = generateCsvData(1000000);

      await csvReader.execute({
        parameters: { data: massiveDataset, headers: true },
        inputs: {},
        context: createExecutionContext(),
      });
    },
    { time: 5000 },
  );
});
```

### Performance Monitoring

**Continuous Performance Tracking:**

- Automated benchmark runs in CI/CD pipeline
- Performance regression detection (>10% slowdown)
- Memory leak detection in long-running processes
- Database query performance monitoring

**Performance Budgets:**

- Node execution: <100ms for simple operations
- Blueprint compilation: <2 seconds for complex workflows
- UI interactions: <100ms response time
- File processing: <1MB/second minimum throughput

## Test Coverage Requirements

### Coverage Targets

**Overall Coverage:**

- Line coverage: 80% minimum, 90% target
- Branch coverage: 75% minimum, 85% target
- Function coverage: 90% minimum, 95% target

**Package-Specific Requirements:**

- Core business logic packages: 90% coverage
- UI component packages: 80% coverage
- Utility packages: 95% coverage
- Integration packages: 70% coverage

### Coverage Enforcement

**CI/CD Integration:**

```bash
# Coverage validation in CI pipeline
pnpm test:coverage --reporter=lcov
pnpm coverage:validate --threshold=80
pnpm coverage:report --format=html
```

## CI/CD Test Automation

### Automated Testing Pipeline

**Pull Request Checks:**

1. **Smoke Tests** (30 seconds): Fast validation of core functionality
2. **Unit Tests** (2 minutes): Complete package test suites
3. **Lint & TypeCheck** (1 minute): Code quality validation
4. **Build Verification** (3 minutes): Ensure all packages build successfully

**Merge to Main:**

1. **Integration Tests** (5 minutes): Cross-package compatibility
2. **E2E Tests** (10 minutes): Critical user journey validation
3. **Performance Tests** (5 minutes): Benchmark regression detection
4. **Security Scans** (3 minutes): Vulnerability assessment

### Test Parallelization

**Efficient Test Execution:**

- Unit tests run in parallel across CPU cores
- Integration tests grouped by dependency chains
- E2E tests distributed across multiple browsers
- Benchmarks isolated to prevent interference

**Resource Optimization:**

```yaml
# GitHub Actions test matrix
strategy:
  matrix:
    node-version: [18, 20]
    test-type: [unit, integration, e2e]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

## Testing Tools and Configuration

### Core Testing Stack

**Primary Tools:**

- **Vitest**: Fast unit and integration test runner
- **Playwright**: Cross-browser E2E testing
- **Testing Library**: React component testing utilities
- **MSW**: API mocking for reliable tests

**Configuration Standards:**

```typescript
// vitest.config.ts - Standard configuration
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      threshold: {
        global: {
          lines: 80,
          branches: 75,
          functions: 90,
          statements: 80,
        },
      },
    },
    benchmark: {
      include: ["**/*.bench.ts"],
      reporters: ["verbose"],
    },
  },
});
```

### Package-Specific Testing

**Per-Package Test Scripts:**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run src/__tests__/unit",
    "test:integration": "vitest run src/__tests__/integration",
    "test:smoke": "vitest run src/__tests__/smoke",
    "test:benchmark": "vitest bench --run",
    "test:e2e": "playwright test || echo 'No E2E tests'",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Quality Assurance Process

### Test-Driven Development

**TDD Workflow:**

1. **Red**: Write failing test that describes desired behavior
2. **Green**: Implement minimal code to make test pass
3. **Refactor**: Improve code while maintaining green tests
4. **Repeat**: Continue cycle for each new feature

**Example TDD Cycle:**

```typescript
// 1. Red: Write failing test
it("Should validate required node parameters", () => {
  const validator = new NodeValidator();
  const result = validator.validate({});
  expect(result.errors).toContain("Name is required");
});

// 2. Green: Make test pass
class NodeValidator {
  validate(params: any) {
    const errors = [];
    if (!params.name) errors.push("Name is required");
    return { errors };
  }
}

// 3. Refactor: Improve implementation
class NodeValidator {
  validate(params: NodeParameters): ValidationResult {
    return {
      errors: this.validateRequired(params),
    };
  }

  private validateRequired(params: NodeParameters): string[] {
    // Improved validation logic
  }
}
```

### Code Review Integration

**Test Review Checklist:**

- [ ] Tests cover the main functionality and edge cases
- [ ] Test names clearly describe the scenario
- [ ] Tests are independent and don't rely on external state
- [ ] Appropriate use of mocking and stubbing
- [ ] Performance tests validate non-functional requirements

## Troubleshooting Common Issues

### Test Failures and Debugging

**Common Test Issues:**

- **Flaky Tests**: Timing issues, race conditions, external dependencies
- **Slow Tests**: Heavy computation, excessive mocking, poor test design
- **Memory Leaks**: Improper cleanup, event listener removal, resource disposal

**Debugging Strategies:**

```typescript
// Debug flaky tests with retry logic
test.retry(3)("Should handle network timeouts gracefully", async () => {
  // Test implementation with proper timeout handling
});

// Debug slow tests with performance monitoring
beforeEach(() => {
  performance.mark("test-start");
});

afterEach(() => {
  performance.mark("test-end");
  const duration = performance.measure(
    "test-duration",
    "test-start",
    "test-end",
  );
  if (duration.duration > 1000) {
    console.warn(`Slow test detected: ${duration.duration}ms`);
  }
});
```

### Performance Test Optimization

**Benchmark Stability:**

- Run benchmarks multiple times for statistical accuracy
- Isolate benchmark runs from other system processes
- Use consistent hardware for reliable comparisons
- Monitor system resources during benchmark execution

**Performance Regression Detection:**

```typescript
// Compare against baseline performance
const baselineTime = 100; // milliseconds
const currentTime = measureExecutionTime();
const regression = (currentTime - baselineTime) / baselineTime;

if (regression > 0.1) {
  // 10% regression threshold
  throw new Error(`Performance regression detected: ${regression * 100}%`);
}
```

## Metrics and Reporting

### Test Metrics Dashboard

**Key Performance Indicators:**

- Test execution time trends
- Coverage percentage over time
- Flaky test identification and frequency
- Build success rate and failure analysis

**Automated Reporting:**

- Daily test summary emails
- Weekly performance trend reports
- Monthly coverage analysis
- Quarterly testing strategy review

### Continuous Improvement

**Testing Strategy Evolution:**

- Regular review of test effectiveness
- Identification of testing gaps and blind spots
- Adoption of new testing tools and techniques
- Training and knowledge sharing within the team

---

**Last Updated**: 2025-09-17
**Version Compatibility**: Atomiton Platform v1.0+
**Review Schedule**: Monthly testing strategy review
