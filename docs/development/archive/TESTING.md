# Testing Strategy Guidelines

**Document Owner**: Barbara (Documentation & Testing Lead)  
**Last Updated**: 2024-01-30  
**Status**: Active

## Overview

This document outlines the testing strategy for the Atomiton project, with particular emphasis on the innovative consumer-oriented testing approach demonstrated in the @atomiton/core package.

## Core Testing Principles

### 1. Consumer-First Testing

Write tests from the perspective of how consumers will actually use the code:

- UI developers integrating components
- Service developers implementing business logic
- Plugin developers extending functionality
- QA engineers validating behavior
- Third-party integrators using APIs

### 2. Contract-Based Testing

Explicitly test and document API contracts:

- Function signatures must remain stable
- Return types must be predictable
- Breaking changes must be detected early
- Semantic versioning must be respected

### 3. Real-World Scenario Testing

Test actual usage patterns, not just isolated units:

- Platform-specific feature detection
- Storage strategy selection
- Cross-environment compatibility
- Progressive enhancement capabilities

## Testing Framework Standards

### Jest Configuration (Preferred for Core Packages)

```javascript
module.exports = {
  testEnvironment: "node", // or 'jsdom' for UI
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.test.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Vitest Configuration (For Vite-based Projects)

```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
    },
  },
});
```

## Test Categories

### 1. Consumer Persona Tests

Tests that simulate real-world usage from different user perspectives.

**Example Structure**:

```typescript
describe("Consumer Persona Tests", () => {
  describe("UI Developer Persona", () => {
    it("should be able to import and use features", async () => {
      // Test as a UI developer would use the package
    });
  });

  describe("Service Developer Persona", () => {
    it("should be able to implement business logic", async () => {
      // Test service implementation patterns
    });
  });
});
```

### 2. API Contract Tests

Tests that ensure the public API remains stable and backward compatible.

**Example Structure**:

```typescript
describe("API Contract Tests", () => {
  it("should export all required functions", () => {
    // Verify exports exist and are correct type
  });

  it("should maintain function signatures", () => {
    // Check parameter counts and types
  });

  it("should maintain return type contracts", () => {
    // Verify return types are consistent
  });
});
```

### 3. Integration Tests

Tests that verify components work together correctly.

### 4. Unit Tests

Traditional unit tests for individual functions and components.

### 5. E2E Tests (Playwright)

End-to-end tests for full application workflows.

## Coverage Requirements

### Minimum Coverage Thresholds

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Critical Path Coverage

Critical paths (payment processing, authentication, data persistence) require 95% coverage.

## Test Organization

### Directory Structure

```
src/
├── __tests__/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── consumer-personas.test.ts
│   └── api-contracts.test.ts
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx  # Co-located tests
└── test/
    └── setup.ts        # Test configuration
```

### Naming Conventions

- Test files: `*.test.ts` or `*.spec.ts`
- Test suites: Descriptive names matching the module
- Test cases: Should complete the sentence "it should..."

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/teardown
- Mock external dependencies
- Reset global state between tests

### 2. Descriptive Test Names

```typescript
// Good
it("should return user profile when valid ID is provided");

// Bad
it("test user");
```

### 3. Arrange-Act-Assert Pattern

```typescript
it("should calculate total price with tax", () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  const taxRate = 0.1;

  // Act
  const total = calculateTotal(items, taxRate);

  // Assert
  expect(total).toBe(33);
});
```

### 4. Mock Appropriately

- Mock external services and APIs
- Don't mock what you're testing
- Use mock implementations for complex dependencies

### 5. Test Error Cases

- Test error handling paths
- Verify error messages are helpful
- Ensure graceful degradation

## Breaking Change Detection

Tests should catch breaking changes early:

### What Constitutes a Breaking Change

- Removing an exported function or type
- Changing function signatures
- Changing return types
- Removing properties from returned objects
- Changing error messages in documented APIs

### Non-Breaking Changes

- Adding new exports
- Adding optional parameters
- Adding properties to returned objects
- Internal implementation changes
- Performance improvements

## Documentation Through Tests

Tests serve as living documentation:

- Show how to use the API correctly
- Demonstrate error handling
- Provide usage examples
- Document edge cases

## Continuous Integration

All tests must pass before merging:

1. Unit tests run on every commit
2. Integration tests run on PR creation
3. E2E tests run before deployment
4. Coverage reports generated automatically

## Test Performance

Keep tests fast:

- Target < 5 seconds for unit test suite
- Target < 30 seconds for integration tests
- Use test parallelization where possible
- Mock expensive operations

## Innovation: Consumer-Oriented Testing

The @atomiton/core package introduces an innovative testing approach that has proven highly effective:

### Benefits Demonstrated

1. **Early Breaking Change Detection**: Consumer tests failed when APIs changed
2. **Real-World Validation**: Tests simulate actual usage patterns
3. **Better Documentation**: Tests show real usage scenarios
4. **Improved API Design**: Thinking from consumer perspective improves APIs
5. **Reduced Integration Issues**: Problems caught before integration

### Recommended for All Packages

This consumer-oriented testing approach should be adopted across all Atomiton packages to ensure consistent quality and usability.

---

**Next Review Date**: 2024-02-15  
**Approval**: Ryan (Project Lead)
