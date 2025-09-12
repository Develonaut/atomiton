# Testing Strategy and Standards

## Test Organization Strategy

We use **co-located tests** to keep tests close to the code they test, improving maintainability and discoverability.

### File Structure

#### Standard Unit Tests

Place `.test.ts` or `.test.tsx` files directly next to the files they test:

```
src/
├── store/
│   ├── actions/
│   │   ├── elements.ts
│   │   └── elements.test.ts        # Co-located test
│   ├── history.ts
│   ├── history.test.ts              # Co-located test
│   ├── getters.ts
│   └── getters.test.ts              # Co-located test
├── components/
│   ├── Canvas/
│   │   ├── CanvasRoot.tsx
│   │   └── CanvasRoot.test.tsx      # Co-located test
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx          # Co-located test
└── hooks/
    ├── useEditorStore.ts
    └── useEditorStore.test.ts       # Co-located test
```

#### Special Test Categories

Use `__tests__` folders for integration, performance, and edge case tests:

```
src/
└── store/
    ├── index.ts
    ├── index.test.ts                # Standard unit test
    └── __tests__/                   # Special tests folder
        ├── integration.test.ts      # Cross-module tests
        ├── performance.test.ts      # Performance benchmarks
        └── edge-cases.test.ts       # Edge case scenarios
```

### Naming Conventions

- **Unit tests**: `[filename].test.ts` or `[filename].test.tsx`
- **Integration tests**: Place in `__tests__/integration.test.ts`
- **Performance tests**: Place in `__tests__/performance.test.ts`
- **Edge case tests**: Place in `__tests__/edge-cases.test.ts`
- **E2E tests**: Keep in root `/playwright` directory

### Benefits of Co-location

1. **Easier navigation** - Tests are right next to implementation
2. **Better organization** - Clear mapping between tests and code
3. **Simpler imports** - No complex relative paths
4. **Encourages testing** - Visible reminder when files lack tests
5. **Cleaner structure** - Special tests grouped logically

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

When migrating from centralized to co-located tests:

1. **Identify existing tests** in `src/__tests__` or similar directories
2. **Move unit tests** next to their source files
3. **Create `__tests__` folders** for special test categories
4. **Update imports** to reflect new paths
5. **Update test config** if needed
6. **Verify all tests pass** after migration
7. **Remove old test directories**

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
