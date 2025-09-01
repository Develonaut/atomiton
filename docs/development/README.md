# Development Standards & Practices

## Purpose

Core development philosophy, standards, and practices for the Atomiton project.

## Development Philosophy

### Core Principles

**DRY (Don't Repeat Yourself)**

- Create reusable components and utilities
- Single source of truth for logic and data
- Extract common patterns into shared packages

**KISS (Keep It Simple)**

- Clear, readable code over clever solutions
- Focused components with single responsibilities
- Progressive complexity - start simple, enhance as needed

**Test-Driven Development**

- Write tests for critical paths
- Focus on behavior, not implementation
- Keep tests maintainable and meaningful

## Code Quality Pipeline

### Required Steps Before Completion

Every piece of code must pass through these steps in order:

```bash
# 1. Format code automatically
npm run format:fix

# 2. Fix auto-fixable lint issues
npm run lint:fix

# 3. Verify no lint errors remain
npm run lint

# 4. Check TypeScript compilation
npm run typecheck

# 5. Ensure build succeeds
npm run build
```

**All must pass with exit code 0** - no exceptions.

### Pre-Commit Hooks

- ✅ **Required**: All commits must pass pre-commit hooks
- ❌ **Forbidden**: Never use `--no-verify` without explicit permission
- 🔧 **Process**: Hooks will auto-format and lint-fix staged files

## TypeScript Standards

### Strict Rules

**Never without explicit permission:**

- `@ts-ignore` or `@ts-expect-error`
- `eslint-disable` comments
- Type casting with `as Type`
- Inline `require()` statements
- `any` type - always use concrete types

**Always:**

- Fix the root cause of type errors
- Use proper ES6 imports at file top
- Maintain strict type safety
- Define explicit return types for public APIs
- Use concrete, specific types instead of `any`

### Type Safety Best Practices

```typescript
// ✅ Good - Explicit, concrete types
function processData(input: string): ProcessedData {
  return { processed: input.toUpperCase() };
}

// ✅ Good - Unknown for truly unknown types (then narrow)
function handleUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  throw new Error("Expected string");
}

// ❌ Bad - Using any
function processData(input: any): any {
  return input;
}

// ❌ Bad - Implicit any or type casting
function processData(input) {
  return input as ProcessedData;
}
```

## Testing Strategy

### Testing Priorities

1. **User-facing behavior** - What the user actually experiences
2. **Business-critical logic** - Core algorithms, calculations, transformations
3. **Integration points** - Where systems connect and data flows
4. **Error scenarios** - What happens when things go wrong
5. **Skip the rest** - If it's not critical, don't test it

### Test Structure

```typescript
describe("Feature", () => {
  it("should behave correctly when used normally", () => {
    // Arrange - Set up test data
    // Act - Perform the action
    // Assert - Verify the result
  });

  it("should handle errors gracefully", () => {
    // Test error conditions
  });
});
```

### Testing Philosophy

- **Quality over quantity** - Write meaningful tests, not coverage padding
- **Critical paths only** - Test what matters: user flows, business logic, edge cases
- **No test bloat** - Avoid testing implementation details or trivial code
- **New features** - Must include tests that verify actual behavior
- **No arbitrary metrics** - Coverage percentage is not a goal

**What to test:**

- User-facing functionality
- Business logic and algorithms
- Error handling and edge cases
- Integration points between systems
- Data transformations

**What NOT to test:**

- Simple getters/setters
- Framework code
- UI styling
- Boilerplate or generated code
- Implementation details that may change

## Component Development

### Component Structure

```typescript
// 1. Define clear interfaces
interface ComponentProps {
  data: DataType;
  onAction: (result: ResultType) => void;
}

// 2. Single responsibility
export function Component({ data, onAction }: ComponentProps) {
  // Focused logic
  return <div>{/* Simple, clear JSX */}</div>;
}

// 3. Export types for consumers
export type { ComponentProps };
```

### Compound Component Pattern (Future)

When we migrate to Mantine UI, use compound components:

```typescript
// Parent provides context
<DataTable>
  <DataTable.Header />
  <DataTable.Body />
  <DataTable.Footer />
</DataTable>
```

## Development Workflow

### Starting New Work

1. **Understand** - Read existing code and patterns
2. **Plan** - Design approach before coding
3. **Implement** - Follow existing conventions
4. **Test** - Verify functionality
5. **Validate** - Run quality pipeline
6. **Document** - Update relevant docs if needed

### Making Changes

**Incremental Approach:**

- Small, focused commits
- Test after each change
- Keep the build green
- Maximum 20 files per commit (ideally less)

**When Refactoring:**

- Separate refactoring from feature work
- Maintain functionality during refactor
- Update tests to match new structure
- Document significant architectural changes

## Performance Guidelines

### Frontend Optimization

- **Code splitting** - Dynamic imports for large components
- **Memo wisely** - React.memo for expensive components
- **Virtualize** - Large lists should use virtual scrolling
- **Lazy load** - Images and heavy components

### Bundle Optimization

- **Tree shaking** - Ensure dead code elimination
- **Analyze** - Regular bundle size analysis
- **Optimize** - Images, fonts, and assets

## Security Practices

### Input Validation

- **Never trust user input** - Always validate
- **Sanitize data** - Prevent XSS and injection
- **Use Zod** - Runtime schema validation

### Sensitive Data

- **No secrets in code** - Use environment variables
- **No logging sensitive data** - Mask or exclude
- **Secure storage** - Encrypt sensitive data at rest

## Quick Reference

### Daily Development Checklist

Before starting:

- [ ] Pull latest changes
- [ ] Install dependencies if package.json changed
- [ ] Check TODO.md for context

Before committing:

- [ ] Run quality pipeline (format → lint → typecheck → build)
- [ ] Write/update tests for new functionality
- [ ] Ensure no console.logs or debug code
- [ ] Verify no secrets or sensitive data

Before pushing:

- [ ] Commits are logical and focused
- [ ] Branch is up to date with main
- [ ] All tests pass locally
- [ ] Build succeeds

---

**Last Updated**: September 1, 2025  
**Status**: Living document - Core standards that evolve with the project  
**Archive**: Detailed documentation in [`/docs/development/archive/`](/docs/development/archive/)
