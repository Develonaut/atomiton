# Code Review Guidelines

## Purpose

This document defines what constitutes "done" for any code changes in the
Atomiton codebase. Use this for self-review, peer review, and automated agent
review.

## Pre-Submission Checklist

### 🎯 Core Requirements

#### Type Safety

- [ ] **NO `any` types** - All `any` types must be replaced with proper types
- [ ] **NO TypeScript errors** - `pnpm typecheck` passes
- [ ] **NO TypeScript warnings** - Clean output, no suppressions without
      justification
- [ ] **Strict mode compliance** - Code works with TypeScript strict mode

#### Code Quality

- [ ] **NO linting errors** - `pnpm lint` passes
- [ ] **NO linting warnings** - All warnings addressed, not suppressed
- [ ] **Tests pass** - `pnpm test` runs successfully
- [ ] **Build succeeds** - `pnpm build` completes without errors

### 📝 Code Cleanliness

#### Comments

- [ ] **NO redundant comments** - Remove comments that just repeat the code
- [ ] **NO commented-out code** - Delete, don't comment (use git history)
- [ ] **Meaningful comments only** - Comments explain WHY, not WHAT

❌ **Bad:**

```typescript
// Increment counter by 1
counter++;

// Set user name
user.name = "John";

// Return true if valid
return isValid;
```

✅ **Good:**

```typescript
// Compensate for zero-based index in user-facing display
counter++;

// Temporary workaround for API bug #1234 - remove after backend fix
user.name = sanitizeName(rawName);
```

### 🍱 Bento Box Principles

- [ ] **Files < 500 lines** - Break up large files
- [ ] **Single responsibility** - Each file/function does ONE thing
- [ ] **No utility grab bags** - Related utilities grouped logically
- [ ] **Clear module boundaries** - Well-defined interfaces
- [ ] **Composable design** - Small pieces that combine well

[See full Bento Box Principles](./BENTO_BOX_PRINCIPLES.md)

### ⚛️ React Hooks Architecture

- [ ] **Hooks as contracts** - Hooks are the glue between React and business
      logic
- [ ] **Extract to utils** - Complex logic lives in pure functions
- [ ] **Testable logic** - Business logic testable without React
- [ ] **Minimal hook body** - Hooks only manage state/effects/refs
- [ ] **Clear separation** - UI concerns vs business logic

### 🏗️ Architecture

#### File Organization

- [ ] **Appropriate file location** - Code is in the right package/directory
- [ ] **Consistent naming** - Follows project conventions
- [ ] **Index exports** - Clean public API via index files
- [ ] **No circular dependencies** - Dependencies flow in one direction

#### Function/Component Design

- [ ] **< 50 lines per function** - Break up complex functions
- [ ] **< 5 parameters** - Use objects for many parameters
- [ ] **Single return type** - Avoid union returns when possible
- [ ] **Pure when possible** - Minimize side effects

### 🧪 Testing

- [ ] **Tests exist** - New code has test coverage
- [ ] **Tests are meaningful** - Test behavior, not implementation
- [ ] **Edge cases covered** - Null, empty, boundary conditions
- [ ] **Tests are isolated** - No test interdependencies

### 📚 Documentation

- [ ] **Public APIs documented** - JSDoc for exported functions/types
- [ ] **Complex logic explained** - Comments for non-obvious code
- [ ] **README updated** - If adding new features/changing API
- [ ] **Types are self-documenting** - Good names, clear intent

### 🎨 Style & Consistency

- [ ] **Consistent with codebase** - Matches existing patterns
- [ ] **Follows conventions** - Uses project style guide
- [ ] **Meaningful names** - Variables/functions clearly named
- [ ] **No magic numbers** - Constants for special values

### 🔒 Security

- [ ] **No hardcoded secrets** - Use environment variables
- [ ] **Input validation** - Validate external inputs
- [ ] **No unsafe operations** - Avoid eval, innerHTML without sanitization
- [ ] **Proper error handling** - Don't expose sensitive info in errors

## Review Process

### For Developers

1. **Self-review first** - Go through this checklist yourself
2. **Run all checks** - `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
3. **Clean up** - Address all issues before requesting review
4. **Document decisions** - Explain non-obvious choices in PR description

### For Reviewers (Human or AI)

1. **Check the checklist** - Ensure all items are addressed
2. **Run verification** - Pull and test locally if needed
3. **Look for patterns** - Identify systematic issues
4. **Suggest improvements** - Offer constructive alternatives
5. **Approve when ready** - Only when all criteria are met

### For AI Agents

When reviewing or writing code, agents should:

1. **Automatically run all checks** before considering work complete
2. **Refuse to submit code with `any` types**
3. **Break up files over 500 lines** without being asked
4. **Remove all redundant comments** proactively
5. **Ensure Bento Box compliance** in all new code

## Common Issues to Catch

### TypeScript Issues

```typescript
// ❌ BAD - Using any
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ GOOD - Proper types
function processData<T extends { value: string }>(data: T[]): string[] {
  return data.map((item) => item.value);
}
```

### File Size Issues

```typescript
// ❌ BAD - 1000+ line file with mixed concerns
// utils.ts
export function formatDate() {}
export function validateEmail() {}
export function calculateTax() {}
export function renderChart() {}
// ... 50 more unrelated functions

// ✅ GOOD - Organized modules
// utils/date/format.ts
export function formatDate() {}

// utils/validation/email.ts
export function validateEmail() {}

// utils/finance/tax.ts
export function calculateTax() {}
```

### Comment Issues

```typescript
// ❌ BAD - Redundant comments
// Get user by id
function getUserById(id: string) {
  // Check if id exists
  if (!id) {
    // Return null if no id
    return null;
  }
  // Find user with matching id
  return users.find((u) => u.id === id);
}

// ✅ GOOD - Meaningful comments only
function getUserById(id: string) {
  if (!id) return null;

  // Performance: O(n) scan is acceptable here because users array
  // is guaranteed to be < 100 items per requirements doc
  return users.find((u) => u.id === id);
}
```

### React Hook Issues

```typescript
// ❌ BAD - Hook contains business logic
function useUserData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);

    // Business logic buried in hook
    const response = await fetch("/api/users");
    const data = await response.json();

    // Complex transformation logic in hook
    const transformedUsers = data.map((user) => {
      const age = calculateAge(user.birthDate);
      const permissions = determinePermissions(user.role);
      const displayName = formatUserName(user.firstName, user.lastName);
      return { ...user, age, permissions, displayName };
    });

    // Validation logic in hook
    const validUsers = transformedUsers.filter((user) => {
      return user.age >= 18 && user.permissions.includes("read");
    });

    setUsers(validUsers);
    setLoading(false);
  };

  return { users, loading, fetchUsers };
}

// ✅ GOOD - Hook is a contract, logic in utils
// utils/user/transform.ts
export function transformUserData(user: RawUser): User {
  return {
    ...user,
    age: calculateAge(user.birthDate),
    permissions: determinePermissions(user.role),
    displayName: formatUserName(user.firstName, user.lastName),
  };
}

// utils/user/validate.ts
export function filterValidUsers(users: User[]): User[] {
  return users.filter(
    (user) => user.age >= 18 && user.permissions.includes("read"),
  );
}

// utils/api/users.ts
export async function fetchUsersFromAPI(): Promise<RawUser[]> {
  const response = await fetch("/api/users");
  return response.json();
}

// hooks/useUserData.ts
function useUserData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Hook orchestrates, utils do the work
      const rawUsers = await fetchUsersFromAPI();
      const transformedUsers = rawUsers.map(transformUserData);
      const validUsers = filterValidUsers(transformedUsers);
      setUsers(validUsers);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, fetchUsers };
}
```

## Automation

### Pre-commit Hooks

These checks should run automatically via Husky:

- Prettier formatting
- ESLint with auto-fix
- TypeScript type checking
- Test execution for changed files

### CI/CD Pipeline

These must pass before merge:

- Full test suite
- Build verification
- Type checking
- Linting
- Security scanning

## Exceptions

Exceptions to these guidelines require:

1. **Documentation** - Explain why in comments
2. **Team approval** - Get consensus on approach
3. **Tracking** - Create issue for future resolution
4. **Time-boxing** - Set deadline for fixing

## Quick Reference Card

```
Before marking any work as "done", verify:

✓ No `any` types
✓ No TypeScript errors/warnings
✓ No lint errors/warnings
✓ All tests pass
✓ Build succeeds
✓ No redundant comments
✓ Files < 500 lines
✓ Functions < 50 lines
✓ Follows Bento Box principles
✓ Proper error handling
✓ Meaningful test coverage
```

## Final Note

**"Done" means ready to ship to production without any additional work.**

If you wouldn't be comfortable with this code running in production handling
real user data, it's not done. Take the time to do it right.
