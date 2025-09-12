# Agent Instructions for Code Development

## Overview

This document provides specific instructions for AI agents working on the Atomiton codebase. Follow these guidelines to ensure your code meets our quality standards.

## Before Starting Any Task

1. **Read the guidelines:**
   - [Bento Box Principles](./BENTO_BOX_PRINCIPLES.md)
   - [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md)

2. **Understand the context:**
   - Check existing patterns in the codebase
   - Review similar files for consistency
   - Verify you're in the correct package/directory

## During Development

### Automatic Actions (Do Without Being Asked)

#### 1. Remove Redundant Comments

```typescript
// ❌ REMOVE THESE AUTOMATICALLY
// Set the user name
user.name = "John";

// Increment counter
counter++;

// Return the result
return result;
```

#### 2. Fix Type Safety

```typescript
// ❌ NEVER SUBMIT THIS
function process(data: any): any {
  return data;
}

// ✅ ALWAYS FIX TO THIS
function process<T>(data: T): T {
  return data;
}
```

#### 3. Break Up Large Files

If a file exceeds 500 lines:

1. Identify logical boundaries
2. Extract into separate modules
3. Create an index file for exports
4. Update imports

#### 4. Apply Bento Box Principles

- One file = one responsibility
- Group related utilities together
- Keep functions under 50 lines
- Ensure composability

### Required Checks Before Completion

Run these commands and fix ALL issues:

```bash
# Must all pass with zero errors/warnings
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

### Status Reporting Format

When completing work, report status like this:

```
✅ Type Safety: PASS - No any types found
✅ Lint: PASS - No errors or warnings
✅ Tests: PASS - All tests passing
✅ Build: PASS - Built successfully
✅ File Size: PASS - Largest file: 342 lines
✅ Comments: CLEANED - Removed 8 redundant comments
✅ Bento Box: COMPLIANT - Single responsibility maintained
```

## Common Patterns to Follow

### File Organization

```
packages/@atomiton/[package]/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities (organized by type)
│   │   ├── string/     # String utilities
│   │   ├── date/       # Date utilities
│   │   └── validation/ # Validators
│   ├── types/          # TypeScript types
│   └── index.ts        # Public API
```

### Export Pattern

```typescript
// src/utils/string/capitalize.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// src/utils/string/index.ts
export { capitalize } from "./capitalize";

// src/index.ts
export * from "./utils/string";
```

## Red Flags - Never Submit Code With These

1. **Any `any` types** - Fix immediately
2. **Files over 500 lines** - Break up first
3. **Functions over 50 lines** - Refactor first
4. **Unorganized utilities** - Group by purpose
5. **Redundant comments** - Remove all
6. **Commented-out code** - Delete it
7. **No tests** - Add tests for new code
8. **Lint warnings** - Fix all warnings
9. **Type errors** - Resolve all TypeScript issues
10. **Build failures** - Must build successfully

## Working with Existing Code

When modifying existing code:

1. **Preserve existing patterns** - Don't introduce new patterns without discussion
2. **Improve incrementally** - If you see issues, fix them
3. **Leave it better** - Boy Scout Rule applies
4. **Update tests** - Ensure tests still pass and add new ones

## Special Instructions

### For React Components

- Use functional components with hooks
- Implement proper memoization
- Follow the UI component philosophy
- Ensure accessibility (ARIA labels, keyboard navigation)

### For React Hooks

- **Hooks are contracts** - they orchestrate, not implement
- **Extract business logic to utils** - all logic in pure functions
- **Keep hooks under 50 lines** - if longer, extract more to utils
- **Utils must be testable** - without React testing library
- See [React Hooks Best Practices](./REACT_HOOKS_BEST_PRACTICES.md)

### For Node Packages

- Keep logic pure when possible
- Implement proper error handling
- Add comprehensive tests
- Document public APIs

### For Build/Config Files

- Maintain consistency across packages
- Document any special configurations
- Keep dependencies minimal

## Completion Criteria

You may only mark work as complete when:

✅ All TypeScript types are properly defined (no `any`)  
✅ Zero lint errors or warnings  
✅ All tests pass  
✅ Build succeeds  
✅ No redundant comments  
✅ Files are under 500 lines  
✅ Functions are under 50 lines  
✅ Bento Box principles followed  
✅ Proper error handling implemented  
✅ Tests cover the new code

## Example Workflow

```bash
# 1. Make changes
# ... your code changes ...

# 2. Check and fix
pnpm lint:fix        # Auto-fix what's possible
pnpm typecheck       # Verify types
pnpm test           # Run tests
pnpm build          # Verify build

# 3. Review your own changes
# - Remove redundant comments
# - Check file sizes
# - Verify Bento Box compliance

# 4. Run final verification
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# 5. Report completion with status
```

## Remember

**Quality over speed.** It's better to take time to do it right than to submit code that needs multiple rounds of fixes.

When in doubt, refer to:

- [Bento Box Principles](./BENTO_BOX_PRINCIPLES.md)
- [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md)
- [Review Checklist](./REVIEW_CHECKLIST.md)
