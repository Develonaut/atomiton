# Test Naming Standards

## Overview

This document establishes consistent test naming conventions for the Atomiton monorepo using Vitest (with Jest compatibility). These standards leverage existing framework patterns rather than creating custom conventions.

## Framework Foundation

**The framework already solved this.** Vitest provides the same API as Jest with `describe`, `it`, and `test` functions. We use these standard patterns consistently across the monorepo.

## Core Conventions

### 1. Use `it` for Individual Tests

**Choose `it` over `test` for consistency and readability:**

```typescript
// ✅ Good - readable with describe
describe("User authentication", () => {
  it("validates correct credentials", () => {
    // test implementation
  });
});

// ❌ Avoid - inconsistent
describe("User authentication", () => {
  test("validates correct credentials", () => {
    // test implementation
  });
});
```

### 2. Use `describe` for Grouping

**Group related tests with descriptive `describe` blocks:**

```typescript
// ✅ Good - clear organization
describe("Storage Service", () => {
  describe("initialization", () => {
    it("creates filesystem storage with userData path", () => {
      // test implementation
    });

    it("handles storage creation failures gracefully", () => {
      // test implementation
    });
  });

  describe("save operations", () => {
    it("saves data to correct file path", () => {
      // test implementation
    });
  });
});
```

### 3. Test Names Should Be Clear and Present Tense

**Write test names that complete the sentence "it...":**

```typescript
// ✅ Good - clear and descriptive
it("validates email format", () => {});
it("throws error when user not found", () => {});
it("merges fields metadata correctly", () => {});
it("handles empty input gracefully", () => {});

// ❌ Avoid - unclear or redundant
it("should validate email", () => {}); // Remove "should"
it("test user validation", () => {}); // Not descriptive
it("works", () => {}); // Too vague
```

### 4. Describe Block Naming

**Use clear, hierarchical naming for describe blocks:**

```typescript
// ✅ Good - clear hierarchy
describe("Component Name", () => {
  describe("given initial state", () => {
    it("renders with default props", () => {});
  });

  describe("when user interaction occurs", () => {
    it("updates state correctly", () => {});
  });
});

// ✅ Good - simple grouping
describe("useForm hook", () => {
  it("creates form with generated fields", () => {});
  it("merges fields metadata", () => {});
  it("handles default values", () => {});
});
```

## Naming Patterns

### For Components

```typescript
describe("Button Component", () => {
  it("renders with correct text", () => {});
  it("handles click events", () => {});
  it("applies disabled state", () => {});
  it("renders with custom variant", () => {});
});
```

### For Hooks

```typescript
describe("useStorage hook", () => {
  it("initializes with empty state", () => {});
  it("saves data to storage", () => {});
  it("loads data from storage", () => {});
  it("handles storage errors", () => {});
});
```

### For Services/Utilities

```typescript
describe("ValidationUtils", () => {
  describe("email validation", () => {
    it("accepts valid email formats", () => {});
    it("rejects invalid email formats", () => {});
  });

  describe("password validation", () => {
    it("enforces minimum length requirement", () => {});
    it("requires special characters", () => {});
  });
});
```

### For API/Integration Tests

```typescript
describe("Storage API", () => {
  describe("save operation", () => {
    it("creates new file when none exists", () => {});
    it("overwrites existing file content", () => {});
    it("handles filesystem permission errors", () => {});
  });
});
```

## Given-When-Then Pattern (Optional)

**For complex scenarios, use Given-When-Then structure:**

```typescript
describe("Storage Service", () => {
  describe("Given storage initialization", () => {
    it("When called, Then should create filesystem storage with userData path", () => {
      // Arrange
      // Act
      // Assert
    });

    it("When storage creation fails, Then should quit app gracefully", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## What NOT to Include

### ❌ Agent Names in Tests

```typescript
// ❌ Never include agent names
it("Brian tests user validation", () => {});
it("Karen validates form submission", () => {});

// ✅ Focus on what is tested
it("validates user credentials", () => {});
it("submits form with valid data", () => {});
```

### ❌ Redundant Words

```typescript
// ❌ Avoid redundant words
it("should test that the user can login", () => {});
it("tests if the component renders", () => {});

// ✅ Be direct and clear
it("allows user login with valid credentials", () => {});
it("renders component with default props", () => {});
```

### ❌ Implementation Details

```typescript
// ❌ Avoid testing implementation
it("calls setState with correct value", () => {});
it("mocks the HTTP request", () => {});

// ✅ Test behavior and outcomes
it("updates display when value changes", () => {});
it("loads user data on mount", () => {});
```

## File Organization

### Test File Naming

```
// ✅ Co-located with source files
src/
  components/
    Button.tsx
    Button.test.tsx
  hooks/
    useForm.ts
    useForm.test.tsx
  utils/
    validation.ts
    validation.test.ts
```

### Integration Test Naming

```
// ✅ Clear integration test naming
src/
  __tests__/
    integration/
      user-authentication.integration.test.ts
      file-storage.integration.test.ts
```

## Examples from Codebase

### Current Good Examples

From `packages/@atomiton/form/src/hooks.test.tsx`:

```typescript
describe("useForm", () => {
  it("creates form with generated fields", () => {});
  it("merges fields metadata", () => {});
  it("includes React Hook Form methods", () => {});
  it("handles default values", () => {});
  it("handles complex schema with optional fields", () => {});
});
```

From `apps/desktop/src/main/services/storage.test.ts`:

```typescript
describe("Storage Service", () => {
  describe("Given storage initialization", () => {
    it("When called, Then should create filesystem storage with userData path", () => {});
    it("When storage creation fails, Then should quit app gracefully", () => {});
  });
});
```

## Tooling Support

### Vitest Configuration

**Our Vitest configs already support these patterns** - no additional setup needed.

### IDE Integration

**Use existing IDE test runners** that integrate with Vitest's standard patterns.

### Test Commands

**Leverage existing package.json scripts:**

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test Button.test.tsx

# Run tests in watch mode
pnpm test --watch
```

## Quality Checklist

Before writing tests, ensure:

- [ ] Using `it` consistently (not mixing with `test`)
- [ ] `describe` blocks group related functionality
- [ ] Test names complete "it..." in present tense
- [ ] No agent names in test descriptions
- [ ] Test names describe behavior, not implementation
- [ ] Clear hierarchy with nested `describe` blocks when needed

## Migration Notes

### From Existing Tests

If updating existing tests to match these standards:

1. Replace `test` with `it` for consistency
2. Remove "should" from test names
3. Ensure describe blocks have clear names
4. Remove any agent names from descriptions

### Framework Compatibility

These standards work with:

- ✅ Vitest (current)
- ✅ Jest (migration compatible)
- ✅ Any testing framework with describe/it pattern

---

**Remember**: The framework already provides these patterns. We're documenting standard usage, not creating custom conventions.
