# TypeScript & Module Standards

## TypeScript Error Handling

**NEVER bypass errors without explicit permission:**

- **NO eslint-disable comments** without explicit permission from Ryan
- **NO @ts-ignore or @ts-expect-error** without explicit permission from Ryan
- **NO type casting (as Type)** without explicit permission from Ryan
- Always fix the root cause of errors, not suppress them

## Type Safety Requirements

- **ALWAYS prefer concrete types** over type casting in ALL scenarios
- If type casting seems necessary, FIRST get explicit permission from Ryan
- If permission is granted for type casting, include a detailed comment explaining:
  - Why the type cast is needed
  - What the actual type is vs what TypeScript infers
  - Why a concrete type solution isn't possible
- Example of what NOT to do: `const value = someVar as string`
- Example of preferred approach: Fix the type definition at the source

## Error Resolution Approach

1. Understand why the error exists
2. Fix the underlying type definitions or logic
3. If a workaround seems necessary, ask Ryan for permission first
4. Document any approved exceptions thoroughly

## Module Import Requirements

**NEVER use inline require() statements:**

- **NO require() calls inside functions** - All imports must be at the top of the file
- **NO dynamic require()** - Use proper ES6 imports instead
- **NO conditional requires** - Structure code to avoid conditional imports
- If circular dependencies seem to require inline imports, refactor the architecture

## Correct Import Patterns

- Use ES6 imports at the top of the file: `import { Something } from './module'`
- For type-only imports use: `import type { SomeType } from './module'`
- Never mix require() and import statements in the same file

## Wrong vs Right Examples

**If You See This Pattern, It's WRONG:**

```typescript
function someFunction() {
  const { Module } = require("./module"); // ❌ WRONG
}
```

**Use This Instead:**

```typescript
import { Module } from "./module"; // ✅ At top of file

function someFunction() {
  // Use Module here
}
```

---

**Part of**: [Guidelines Index](./README.md)  
**Referenced by**: [Agent Execution Plan](../../.claude/agents/coordination/AGENT_EXECUTION_PLAN.md)
