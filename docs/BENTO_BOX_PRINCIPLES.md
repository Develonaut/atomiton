# Bento Box Principles

## Overview

The Bento Box philosophy is our core architectural principle at Atomiton. Like a Japanese bento box with its organized compartments, our code should be composed of small, focused, self-contained modules that combine to create a complete system.

## Core Principles

### 1. Single Responsibility

Each module/component/function should do ONE thing well.

### 2. Clear Boundaries

Modules should have explicit, well-defined interfaces with clear inputs and outputs.

### 3. Self-Contained

Each "compartment" should be as independent as possible, with minimal dependencies.

### 4. Composable

Small pieces should combine elegantly to form larger functionality.

### 5. Predictable

Given the same inputs, a module should always produce the same outputs.

## Application Guidelines

### File Organization

**✅ DO:**

- Keep files small and focused (< 200 lines preferred, < 500 lines maximum)
- One primary export per file
- Group related functionality in directories
- Use index files for clean exports

**❌ DON'T:**

- Create "util" grab bags with unrelated functions
- Mix concerns in a single file
- Create deep nesting (> 3 levels)

### Function Design

**✅ DO:**

```typescript
// Single purpose, clear name
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Composable functions
export function formatUserName(firstName: string, lastName: string): string {
  return `${capitalizeFirst(firstName)} ${capitalizeFirst(lastName)}`;
}
```

**❌ DON'T:**

```typescript
// Multiple responsibilities
export function processUserDataAndSendEmail(user: User): void {
  // Validates user
  // Formats data
  // Sends email
  // Updates database
  // ... too many things!
}
```

### Component Structure

**✅ DO:**

```typescript
// Separate concerns into focused components
<UserProfile>
  <Avatar />
  <UserInfo />
  <UserActions />
</UserProfile>
```

**❌ DON'T:**

```typescript
// Everything in one massive component
<UserProfileWithAvatarAndInfoAndActionsAndSettings />
```

### Module Exports

**✅ DO:**

```typescript
// Clear, focused exports
export { validateEmail } from "./validators";
export { formatUserName } from "./formatters";
export type { UserProfile } from "./types";
```

**❌ DON'T:**

```typescript
// Kitchen sink export
export * from "./everything";
```

## Benefits

1. **Testability**: Small, focused modules are easier to test
2. **Maintainability**: Changes are localized and predictable
3. **Reusability**: Well-defined modules can be reused across the codebase
4. **Clarity**: Code intent is obvious from structure
5. **Debugging**: Issues are easier to isolate

## Examples in Practice

### React Hooks

```typescript
// hooks/useData.ts - Hook is just the contract
export function useData() {
  const [data, setData] = useState([]);

  const loadData = async () => {
    const raw = await fetchData(); // utils/api.ts
    const processed = processData(raw); // utils/transform.ts
    const validated = validateData(processed); // utils/validate.ts
    setData(validated);
  };

  return { data, loadData };
}
```

See [React Hooks Best Practices](./REACT_HOOKS_BEST_PRACTICES.md) for detailed patterns.

### API Module

```typescript
// api/auth.ts - Authentication specific
export const auth = {
  login: (credentials: Credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
};

// api/users.ts - User management specific
export const users = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (id: string, data: UserUpdate) =>
    api.patch(`/users/${id}`, data),
};
```

### Utility Functions

```typescript
// utils/string/capitalize.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// utils/string/truncate.ts
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

// utils/string/index.ts
export { capitalize } from "./capitalize";
export { truncate } from "./truncate";
```

## Red Flags

Signs that Bento Box principles are being violated:

- Files over 500 lines
- Functions with more than 3 responsibilities
- "Utils" files with unrelated functions
- Components that know too much about their context
- Modules with circular dependencies
- Deep prop drilling
- God objects/classes
- Manager/Handler/Controller classes that do everything

## Migration Strategy

When refactoring existing code:

1. **Identify boundaries**: Find natural separation points
2. **Extract modules**: Pull out focused functionality
3. **Define interfaces**: Create clear contracts between modules
4. **Test in isolation**: Ensure each module works independently
5. **Compose**: Combine modules to recreate original functionality

## Remember

> "Every big thing is just small things combined thoughtfully."

The Bento Box principle isn't just about code organization—it's about thinking in small, composable pieces that create elegant solutions.
