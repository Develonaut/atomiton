# Vite Config Migration Checklist

## Package: [PACKAGE_NAME]

### Pre-Migration Analysis

- [ ] Review current vite.config.ts
- [ ] Document current line count: **\_** lines
- [ ] Identify package type:
  - [ ] TypeScript Library
  - [ ] React Library
  - [ ] Application
- [ ] List external dependencies
- [ ] Document custom plugins
- [ ] Note chunking strategy
- [ ] Check for special build requirements

### Configuration Mapping

- [ ] Choose appropriate preset:
  - [ ] `defineLibraryConfig`
  - [ ] `defineReactLibraryConfig`
  - [ ] `defineAppConfig`
- [ ] Map basic options:
  - [ ] name
  - [ ] entry (if custom)
  - [ ] external dependencies
- [ ] Map advanced options:
  - [ ] chunks configuration
  - [ ] enableVisualizer
  - [ ] enableMinification
  - [ ] testEnvironment
- [ ] Handle special cases:
  - [ ] Custom plugins → additionalConfig
  - [ ] Server configuration
  - [ ] Optimize deps
  - [ ] Asset handling

### Implementation

- [ ] Add @atomiton/vite-config to devDependencies
- [ ] Create new vite.config.ts using preset
- [ ] Document new line count: **\_** lines
- [ ] Calculate reduction: **\_** %
- [ ] Preserve any custom functionality in additionalConfig

### Testing

- [ ] Run `pnpm install`
- [ ] Run `pnpm build`
- [ ] Verify output in dist/ folder:
  - [ ] index.js exists
  - [ ] index.cjs exists (if applicable)
  - [ ] index.d.ts exists
  - [ ] Source maps generated
- [ ] Check bundle size:
  - [ ] Before: **\_** KB
  - [ ] After: **\_** KB
- [ ] Run `pnpm typecheck`
- [ ] Run `pnpm test` (if applicable)
- [ ] Test in consuming package (if applicable)

### Quality Checks

- [ ] No TypeScript errors
- [ ] No missing exports
- [ ] Bundle size acceptable
- [ ] Build time acceptable
- [ ] All tests pass

### Documentation

- [ ] Update package README if build changed
- [ ] Note any migration issues
- [ ] Document any workarounds needed
- [ ] Update migration strategy doc with learnings

### Sign-off

- [ ] Developer: ******\_******
- [ ] Reviewer: ******\_******
- [ ] Date: ******\_******

## Migration Notes

```
[Add any specific notes, issues, or learnings from this migration]
```

## Before/After Comparison

### Before (Original Config)

```typescript
// Paste key parts of original config
// Line count: _____
```

### After (Migrated Config)

```typescript
// Paste new config
// Line count: _____
// Reduction: _____%
```

## Issues Encountered

- [ ] None
- [ ] Issues (document below):

```
[Document any issues and their resolutions]
```

## Rollback Plan

If migration causes issues:

1. Revert vite.config.ts changes
2. Remove @atomiton/vite-config from package.json
3. Run `pnpm install`
4. Rebuild and test

---

_Template Version: 1.0_
_For use with @atomiton/vite-config migration_
