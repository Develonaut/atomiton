# Code Style Guidelines

## Module Organization and Imports

### Barrel Exports (index.ts) - Use Minimally

**⚠️ CRITICAL PERFORMANCE CONSIDERATION: Barrel exports significantly impact
build times and bundle sizes.**

#### When to Use Barrel Exports (LIMITED CASES)

✅ **ONLY use for:**

1. **Component composition** - When components have variants/slots that work
   together

   ```typescript
   // components/Card/index.ts - ACCEPTABLE
   export { Card } from "./Card";
   export { CardHeader } from "./CardHeader";
   export { CardBody } from "./CardBody";
   export { CardFooter } from "./CardFooter";
   ```

2. **Package public API** - Single entry point for external consumers
   ```typescript
   // packages/@atomiton/ui/src/index.ts - ACCEPTABLE
   export { Button, Card, Modal } from "./components";
   export type { ButtonProps, CardProps } from "./types";
   ```

#### When NOT to Use Barrel Exports

❌ **NEVER use for:**

- Utilities or helper functions
- Types and interfaces
- Services, stores, or hooks
- Constants or configuration
- Internal module organization

#### Performance Impact Examples

```typescript
// ❌ BAD - Creates unnecessary module graph complexity
// utils/index.ts
export * from "./string";
export * from "./array";
export * from "./date";
export * from "./number";

// Importing one function loads ALL utilities
import { capitalize } from "@/utils"; // Loads everything!
```

```typescript
// ✅ GOOD - Direct imports for better tree-shaking
import { capitalize } from "@/utils/string";
import { formatDate } from "@/utils/date";
```

#### Why This Matters

1. **Build Performance**: Each barrel export adds to the module resolution time
2. **Bundle Size**: Prevents effective tree-shaking
3. **Circular Dependencies**: Barrel exports increase risk of circular imports
4. **Code Clarity**: Direct imports show exactly where code comes from
5. **TypeScript Performance**: TS must analyze entire barrel chains

#### Voorhees Review Checkpoint

Before creating ANY index.ts file, ask:

- Is this for component composition with variants/slots?
- Is this the public API of a package?
- Can we use direct imports instead?

If the answer to the last question is yes, DO NOT create the barrel export.

## Comments

### Philosophy: Code Should Speak for Itself

Our codebase follows the principle that **good code is self-documenting**.
Comments should be used sparingly and strategically, not as a crutch for unclear
code.

### When NOT to Comment

❌ **Avoid obvious comments that just repeat what the code does:**

```typescript
// Bad
console.log("Logging user data"); // Logs user data to console
const userId = user.id; // Get the user ID
if (isValid) {
  // Check if valid
  return true; // Return true
}
```

```typescript
// Good
console.log("Logging user data");
const userId = user.id;
if (isValid) {
  return true;
}
```

### When TO Comment

✅ **Use comments for these specific cases:**

#### 1. Complex Business Logic

```typescript
// Calculate compound interest with irregular payment schedules
// Formula accounts for variable payment dates and leap years
const interest = calculateCompoundInterest(principal, rate, periods);
```

#### 2. Non-Obvious Algorithmic Decisions

```typescript
// Using binary search instead of linear scan for O(log n) performance
// on sorted datasets larger than 1000 items
const index = binarySearch(sortedArray, target);
```

#### 3. External API Quirks or Workarounds

```typescript
// Stripe webhook signatures expire after 5 minutes
// We need to validate immediately to avoid replay attacks
const isValidSignature = validateWebhookSignature(payload, signature);
```

#### 4. File/Module Documentation Headers

```typescript
/**
 * Blueprint Node Engine
 *
 * Manages the execution flow of visual programming nodes,
 * handling dependency resolution, parallel processing,
 * and error propagation across the node graph.
 *
 * Key concepts:
 * - Nodes execute based on input availability
 * - Cycles are detected and prevented
 * - Failed nodes don't block independent branches
 */
```

#### 5. Function Documentation (when behavior isn't obvious)

```typescript
/**
 * Debounces function calls to prevent excessive API requests
 * during rapid user input. Cancels previous calls if new ones
 * arrive within the delay window.
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  // Implementation...
}
```

#### 6. TODO/FIXME for Known Issues

```typescript
// TODO: Optimize this query when user count exceeds 100k
// Current approach loads all users into memory
const allUsers = await User.findAll();

// FIXME: Race condition possible if user updates profile
// while this calculation is running
const score = calculateUserScore(user);
```

### Comment Quality Standards

1. **Explain WHY, not WHAT**: Focus on the reasoning behind the code
2. **Be concise but complete**: One clear sentence is better than a paragraph
3. **Keep comments current**: Update comments when code changes
4. **Use proper grammar**: Comments are part of our documentation

### Examples in Context

```typescript
// Bad - Comments explain obvious operations
function processUser(user: User) {
  // Validate the user object
  if (!user) {
    // Return null if user is invalid
    return null;
  }

  // Get user email
  const email = user.email;
  // Convert email to lowercase
  const normalizedEmail = email.toLowerCase();
  // Return processed user
  return { ...user, email: normalizedEmail };
}

// Good - Code is self-explanatory
function processUser(user: User) {
  if (!user) {
    return null;
  }

  const normalizedEmail = user.email.toLowerCase();
  return { ...user, email: normalizedEmail };
}

// Good - Comments explain business context
function processUser(user: User) {
  if (!user) {
    return null;
  }

  // Email normalization prevents duplicate accounts due to case differences
  // This matches our authentication provider's behavior
  const normalizedEmail = user.email.toLowerCase();
  return { ...user, email: normalizedEmail };
}
```

### Implementation Note

Our ESLint configuration enforces this policy by prohibiting comments unless
explicitly requested during code review.
