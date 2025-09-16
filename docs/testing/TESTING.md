# Testing Strategy and Standards

_Last Updated: 2025-01-16_

> **Quick Reference**: [Package Testing Guide](./PACKAGE_TESTING_GUIDE.md) | [Performance Tracking](./TEST_PERFORMANCE_TRACKING.md) | [Summary](./TESTING_IMPROVEMENTS_SUMMARY.md)

## Overview

Atomiton uses a comprehensive testing strategy combining multiple test types with strict performance requirements and standardized organization across all packages.

### Key Requirements
- ✅ 8 standard test scripts per package (no more, no less)
- ✅ Co-located `__tests__` folders for test organization
- ✅ Smoke tests must complete in <5 seconds
- ✅ Benchmark regression threshold of 10%
- ✅ TypeScript for all test scripts and tools

## Test Organization Strategy

We **REQUIRE co-located tests** using `__tests__` folders next to the files they test. This provides clear organization while maintaining proximity to the code being tested.

### File Structure

#### Standard Unit Tests (REQUIRED Pattern)

**ALWAYS place tests in `__tests__` folders co-located with the files they test:**

```
src/
├── store/
│   ├── actions/
│   │   ├── elements.ts
│   │   └── __tests__/
│   │       └── elements.test.ts     # Co-located test folder
│   ├── history.ts
│   ├── getters.ts
│   └── __tests__/
│       ├── history.test.ts          # Co-located tests
│       └── getters.test.ts          # Co-located tests
├── components/
│   ├── Canvas/
│   │   ├── CanvasRoot.tsx
│   │   ├── CanvasNode.tsx
│   │   └── __tests__/
│   │       ├── CanvasRoot.test.tsx  # Co-located tests
│   │       └── CanvasNode.test.tsx  # Co-located tests
│   └── Button/
│       ├── Button.tsx
│       ├── ButtonGroup.tsx
│       └── __tests__/
│           ├── Button.test.tsx      # Co-located tests
│           └── ButtonGroup.test.tsx # Co-located tests
└── hooks/
    ├── useEditorStore.ts
    ├── useNodeSelection.ts
    └── __tests__/
        ├── useEditorStore.test.ts   # Co-located tests
        └── useNodeSelection.test.ts # Co-located tests
```

#### Smoke Tests (REQUIRED for all packages)

**Smoke tests MUST be placed in `src/__tests__/smoke/` directory at the package root:**

```
src/
├── __tests__/
│   └── smoke/
│       ├── api.smoke.test.ts        # Public API surface tests
│       ├── validation.smoke.test.ts # Critical validation paths
│       └── integration.smoke.test.ts # Key integration points
├── components/...                   # Regular co-located unit tests
└── utils/...                        # Regular co-located unit tests
```

**Smoke Test Philosophy:**

- Test the public API exports from the package
- Verify critical paths work end-to-end
- Keep tests minimal and focused (< 5 seconds total)
- Run in pre-commit hooks to catch breaking changes early
- Name files with `.smoke.test.ts` suffix for easy identification
- Group by domain when multiple smoke test areas exist

**Example Smoke Test Structure:**

```typescript
// src/__tests__/smoke/api.smoke.test.ts
import * as PackageAPI from "../../index";

describe("Package API Smoke Tests", () => {
  it("exports expected functions", () => {
    expect(PackageAPI.mainFunction).toBeDefined();
  });

  it("critical path works", () => {
    const result = PackageAPI.mainFunction(validInput);
    expect(result).toBeDefined();
  });
});
```

#### Integration and Special Test Categories

For tests that span multiple modules or test broader functionality:

```
src/
├── store/
│   ├── index.ts
│   ├── actions/
│   │   └── __tests__/              # Unit tests for actions
│   └── __tests__/
│       ├── index.test.ts           # Tests for store/index.ts
│       ├── integration.test.ts     # Cross-module integration tests
│       ├── performance.test.ts     # Performance benchmarks
│       └── edge-cases.test.ts      # Edge case scenarios
└── __tests__/
    ├── smoke/                       # Package-level smoke tests
    │   ├── api.smoke.test.ts
    │   └── critical-paths.smoke.test.ts
    └── integration/                 # Package-level integration tests
        └── workflow.test.ts
```

### Naming Conventions

- **Unit tests**: `[filename].test.ts` or `[filename].test.tsx`
- **Integration tests**: Place in `__tests__/integration.test.ts`
- **Performance tests**: Place in `__tests__/performance.test.ts`
- **Edge case tests**: Place in `__tests__/edge-cases.test.ts`
- **E2E tests**: Keep in root `/playwright` directory

### Why Co-located `__tests__` Folders are Required

1. **Clear organization** - Tests grouped together but still next to their code
2. **Better navigation** - Easy to find all tests for a module
3. **Simpler imports** - Short relative paths (`"../filename"` instead of `"../../../filename"`)
4. **Clean file listings** - Implementation files not mixed with test files
5. **Easier refactoring** - Tests move with their parent directory
6. **Visual clarity** - `__tests__` folders clearly indicate test coverage
7. **IDE friendly** - Most IDEs recognize and properly handle `__tests__` folders

**This pattern is required** - all tests must be in co-located `__tests__` folders.

## Test Categories

### Unit Tests (Co-located)

- Test individual functions, components, or modules in isolation
- Mock external dependencies
- Focus on single responsibility
- Fast execution time

### Integration Tests (`__tests__/integration.test.ts`)

- Test interaction between multiple modules
- Verify data flow through the system
- Test real implementations (minimal mocking)
- Ensure components work together correctly

### Performance Tests (`__tests__/performance.test.ts`)

- Benchmark critical operations
- Test with large datasets (100, 500, 1000+ items)
- Monitor memory usage
- Validate performance requirements

### Edge Case Tests (`__tests__/edge-cases.test.ts`)

- Test boundary conditions
- Handle invalid inputs gracefully
- Test error scenarios
- Verify fallback behaviors

### E2E Tests (`/playwright`)

- Test complete user workflows
- Verify UI interactions
- Cross-browser testing
- Real environment testing

## Testing Framework

We use **Vitest** for unit and integration testing:

- Fast execution with Vite integration
- Jest-compatible API
- Built-in TypeScript support
- Excellent DX with hot module replacement

## Coverage Requirements

### Minimum Coverage Targets

- **Critical paths**: 80% coverage required
- **Store/State management**: 90% coverage required
- **UI Components**: 70% coverage required
- **Utilities**: 95% coverage required

### What to Test

- ✅ Business logic and algorithms
- ✅ State management and reducers
- ✅ User interactions and event handlers
- ✅ API integrations and data transformations
- ✅ Error handling and edge cases
- ✅ Performance-critical code paths

### What NOT to Test

- ❌ Third-party library internals
- ❌ Simple getters/setters
- ❌ Framework boilerplate
- ❌ Styles and CSS
- ❌ Type definitions

## Best Practices

### General Guidelines

1. **Write tests first** when fixing bugs (TDD for bug fixes)
2. **Keep tests focused** - one concept per test
3. **Use descriptive names** - test name should explain what and why
4. **Follow AAA pattern** - Arrange, Act, Assert
5. **Mock at boundaries** - mock external dependencies, not internals
6. **Test behavior, not implementation** - focus on outputs, not how

### Test Quality

- Tests should be deterministic (no random failures)
- Tests should be independent (order shouldn't matter)
- Tests should be fast (< 100ms for unit tests)
- Tests should be readable (clear intent)
- Tests should be maintainable (easy to update)

### Example Test Structure

```typescript
// store/actions/elements.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { addElement, removeElement } from "./elements";

describe("Element Actions", () => {
  describe("addElement", () => {
    it("should add element to store", () => {
      // Arrange
      const initialState = { elements: [] };
      const newElement = { id: "1", type: "node" };

      // Act
      const result = addElement(initialState, newElement);

      // Assert
      expect(result.elements).toHaveLength(1);
      expect(result.elements[0]).toEqual(newElement);
    });

    it("should handle duplicate IDs gracefully", () => {
      // Edge case test
    });
  });
});
```

## Running Tests

### Standardized Package Scripts

All packages must implement standardized test scripts as defined in [PACKAGE_TEST_SCRIPTS.md](./PACKAGE_TEST_SCRIPTS.md):

- `test:unit` - Unit tests (Vitest)
- `test:smoke` - Critical path tests (< 5s, pre-commit)
- `test:benchmark` - Performance benchmarks
- `test:e2e` - End-to-end tests (Playwright)
- `test:all` - Complete test suite
- `test:watch` - Development mode
- `test:coverage` - Coverage reports

### Commands

```bash
# Run unit tests
pnpm test:unit

# Run smoke tests (pre-commit)
pnpm test:smoke

# Run benchmarks
pnpm test:benchmark

# Run E2E tests
pnpm test:e2e

# Run all test suites
pnpm test:all

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/store/actions/elements.test.ts

# Run tests matching pattern
pnpm test --grep "addElement"
```

### CI/CD Integration

- Tests run automatically on pull requests
- Coverage reports generated and tracked
- Performance benchmarks compared against baselines
- Failed tests block merging

## Migration Guide

When organizing tests into co-located `__tests__` folders:

1. **Create `__tests__` folders** next to the files being tested
2. **Move test files** into the appropriate `__tests__` folder
3. **Update imports** in test files (typically `"../filename"` for the file being tested)
4. **Organize by module** - each directory gets its own `__tests__` folder
5. **Keep smoke tests** at `src/__tests__/smoke/` (package root level)
6. **Verify all tests pass** after reorganization

### Example Migration

```bash
# Before (scattered test files)
src/components/Button.tsx
src/components/Button.test.tsx
src/hooks/useAuth.ts
src/hooks/useAuth.test.ts

# After (organized in __tests__ folders)
src/components/Button.tsx
src/components/__tests__/Button.test.tsx
src/hooks/useAuth.ts
src/hooks/__tests__/useAuth.test.ts
```

### Directory Structure Benefits

- **Clean separation** - Implementation and test files don't clutter the same directory
- **Easy to identify** - Clear which modules have test coverage
- **Batch operations** - Easy to run all tests in a module
- **Standard pattern** - Recognized by most tools and IDEs

## Future Improvements

- [ ] Add mutation testing for critical paths
- [ ] Implement visual regression testing
- [ ] Add contract testing for APIs
- [ ] Set up property-based testing for complex logic
- [ ] Create test data factories
- [ ] Add accessibility testing

---

_Last Updated: 2025-01-09_
_Test Structure: Co-located with `__tests__` folders for special categories_
