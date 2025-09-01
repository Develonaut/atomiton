# Core Package Architecture

## Package Purpose

A TypeScript package providing:

- Node base classes
- Type definitions
- Execution engine
- Platform detection

## What It Actually Is

A package with 375+ compilation errors that blocks everything else.

## Main Problems

### Type Errors

- Missing `platformConstraints` in NodeDefinition
- Zod validation broken
- Generic type constraints violated

### Build Issues

- Can't generate .d.ts files
- Export syntax incompatible with isolatedModules
- Circular dependencies

### Integration Failures

- UI can't import from core
- Tests can't run
- Platform detection not working

## File Structure (Theoretical)

```
packages/core/
├── src/
│   ├── nodes/       # Base classes (broken)
│   ├── types/       # Type definitions (incomplete)
│   ├── execution/   # Runtime (non-functional)
│   └── platform/    # Detection (not integrated)
└── dist/           # Can't build
```

## Fix Priority

1. Type definitions (add missing properties)
2. Export syntax (fix isolatedModules)
3. Zod validation (fix property access)
4. Circular dependencies (refactor imports)
5. Build configuration (enable compilation)

---

**Reality**: 1,241 lines describing broken architecture. Focus on fixing compilation.

📁 **Original Design**: See [archive/CORE_PACKAGE_ARCHITECTURE_DESIGN.md](./archive/CORE_PACKAGE_ARCHITECTURE_DESIGN.md) for the complete 1,241-line design document (for reference after fixing compilation).
