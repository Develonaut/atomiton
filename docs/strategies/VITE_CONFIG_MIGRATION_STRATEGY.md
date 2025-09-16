# Vite Config Migration Strategy

## Overview

This document outlines the strategy for migrating all packages to use the shared @atomiton/vite-config package. The migration will reduce configuration duplication by 70%+ and ensure consistency across the monorepo.

## Current Status

✅ **@atomiton/vite-config** package is complete with all necessary features
✅ **Proof of concept migrations** completed for 3 packages showing 70-84% reduction
✅ **Dual build architecture** implemented for nodes package

## Migration Priority

### Phase 1: Core Libraries (Simple migrations)

These packages have straightforward configurations and can be migrated quickly:

1. **@atomiton/utils** - Basic library config
2. **@atomiton/events** - Basic library config
3. **@atomiton/yaml** - Basic library config
4. **@atomiton/storage** - Basic library config
5. **@atomiton/store** - Basic library config
6. **@atomiton/hooks** - Basic library config

### Phase 2: React Libraries (Moderate complexity)

These packages need React-specific configurations:

7. **@atomiton/ui** - React library with Tailwind
8. **@atomiton/form** - React library
9. **@atomiton/router** - React library

### Phase 3: Applications (Complex)

These require app-specific configurations:

10. **apps/client** - Main application
11. **apps/desktop** - Electron wrapper

### Already Migrated (Examples)

✅ **@atomiton/conductor** - Library config with chunking
✅ **@atomiton/di** - Library config
✅ **@atomiton/editor** - React library config
✅ **@atomiton/nodes** - Dual build config

## Migration Approach

### For Each Package:

1. **Analyze current config**
   - Identify custom settings
   - Note external dependencies
   - Document chunking strategy
   - Check for special plugins

2. **Choose appropriate preset**
   - `defineLibraryConfig` for TypeScript libraries
   - `defineReactLibraryConfig` for React components
   - `defineAppConfig` for applications

3. **Map configuration**
   - Convert to preset options
   - Move complex logic to additionalConfig
   - Preserve custom rollup plugins

4. **Test thoroughly**
   - Run `pnpm build`
   - Verify output structure
   - Check bundle sizes
   - Test in consuming packages

## Configuration Mapping Guide

### Basic Library

```typescript
// Before: 90+ lines
export default defineConfig({
  plugins: [dts(), visualizer()],
  build: {
    /* complex config */
  },
  // ...
});

// After: ~10 lines
export default defineLibraryConfig({
  name: "PackageName",
  external: ["dependency1", "dependency2"],
  chunks: {
    utils: ["src/utils/"],
  },
});
```

### React Library

```typescript
// Before: 100+ lines
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss(), dts()],
  // ...
});

// After: ~15 lines
export default defineReactLibraryConfig({
  name: "ComponentLibrary",
  enableTailwind: true,
  external: ["@external/dep"],
  chunks: {
    components: ["src/components/"],
  },
});
```

### Application

```typescript
// Before: 100+ lines
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    /* config */
  },
  // ...
});

// After: ~20 lines
export default defineAppConfig({
  port: 5173,
  workspacePackages: ["@atomiton/ui", "@atomiton/editor"],
  aliases: {
    "@": "./src",
  },
  enableTailwind: true,
});
```

## Special Cases

### Dual Build (like nodes package)

- Main vite.config.ts for Node.js build
- vite.config.browser.ts for browser-safe build
- Update package.json exports
- Update build script to run both

### Custom Plugins

Use `additionalConfig` to add custom plugins:

```typescript
defineLibraryConfig({
  name: "Package",
  additionalConfig: {
    plugins: [customPlugin()],
  },
});
```

### Environment-specific Config

```typescript
defineAppConfig({
  additionalConfig: {
    resolve: {
      conditions:
        process.env.NODE_ENV === "development"
          ? ["development", "import", "module", "browser", "default"]
          : undefined,
    },
  },
});
```

## Benefits

### Quantifiable Improvements

- **70-84% reduction** in config lines
- **Single source of truth** for build configuration
- **Consistent output** across all packages
- **Easier updates** - change once, apply everywhere

### Maintenance Benefits

- Simplified debugging of build issues
- Centralized optimization strategies
- Consistent chunking patterns
- Unified plugin management

## Risks & Mitigations

| Risk                         | Mitigation                          |
| ---------------------------- | ----------------------------------- |
| Breaking existing builds     | Test each migration thoroughly      |
| Loss of custom functionality | Use additionalConfig for edge cases |
| Performance regression       | Compare bundle sizes before/after   |
| TypeScript resolution issues | Already fixed in conductor example  |

## Success Criteria

- [ ] All packages build successfully
- [ ] Bundle sizes remain same or improve
- [ ] TypeScript checks pass
- [ ] Tests continue to pass
- [ ] 70%+ reduction in config lines achieved
- [ ] No functionality lost

## Next Steps

1. **Prioritize Phase 1** packages for quick wins
2. **Create migration PR template** for consistency
3. **Migrate one package at a time** with thorough testing
4. **Document any edge cases** discovered during migration
5. **Update this strategy** based on learnings

## Tracking Progress

| Package             | Status      | Config Reduction | Notes                  |
| ------------------- | ----------- | ---------------- | ---------------------- |
| @atomiton/conductor | ✅ Migrated | 70%              | Example implementation |
| @atomiton/di        | ✅ Migrated | 84%              | Simplest config        |
| @atomiton/editor    | ✅ Migrated | 62%              | React library example  |
| @atomiton/nodes     | ✅ Migrated | 48%              | Dual build example     |
| @atomiton/utils     | ⏳ Pending  | -                | Phase 1                |
| @atomiton/events    | ⏳ Pending  | -                | Phase 1                |
| @atomiton/yaml      | ⏳ Pending  | -                | Phase 1                |
| @atomiton/storage   | ⏳ Pending  | -                | Phase 1                |
| @atomiton/store     | ⏳ Pending  | -                | Phase 1                |
| @atomiton/hooks     | ⏳ Pending  | -                | Phase 1                |
| @atomiton/ui        | ⏳ Pending  | -                | Phase 2                |
| @atomiton/form      | ⏳ Pending  | -                | Phase 2                |
| @atomiton/router    | ⏳ Pending  | -                | Phase 2                |
| apps/client         | ⏳ Pending  | -                | Phase 3                |
| apps/desktop        | ⏳ Pending  | -                | Phase 3                |

---

_Last Updated: Current Session_
_Strategy Owner: Development Team_
_Target Completion: Progressive rollout_
