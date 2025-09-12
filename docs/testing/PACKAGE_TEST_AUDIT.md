# Package Test Script Audit Report

## Date: 2025-01-12

## Summary

Only 1 out of 13 packages (@atomiton/form) fully implements the standardized test scripts. Most packages are missing critical test infrastructure.

## Required Scripts (per PACKAGE_TEST_SCRIPTS.md)

1. `test` - Default test command
2. `test:unit` - Unit tests
3. `test:smoke` - Critical path tests (< 5s)
4. `test:benchmark` - Performance benchmarks
5. `test:e2e` - End-to-end tests
6. `test:all` - Complete test suite
7. `test:watch` - Development mode
8. `test:coverage` - Coverage reports

## Package Status

### ✅ Fully Compliant (1/13)

- **@atomiton/form** - All 8 scripts implemented

### ⚠️ Partially Compliant (10/13)

#### @atomiton/conductor

- ✅ Has: `test:coverage`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`, `test:watch`

#### @atomiton/core

- ✅ Has: `test:watch`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`, `test:coverage`

#### @atomiton/di

- ✅ Has: `test:watch`, `test:coverage`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`

#### @atomiton/editor

- ✅ Has: `test:watch`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`, `test:coverage`

#### @atomiton/events

- ✅ Has: `test:watch`, `test:coverage`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`

#### @atomiton/hooks

- ✅ Has: `test:run` (non-standard), `test:coverage`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`, `test:watch`

#### @atomiton/nodes

- ✅ Has: `test:watch`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`, `test:coverage`

#### @atomiton/storage

- ✅ Has: `test:coverage`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`, `test:watch`

#### @atomiton/store

- ✅ Has: `test:watch`, `test:coverage`
- ❌ Missing: `test`, `test:unit`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`

#### @atomiton/ui

- ✅ Has: `test:unit`, `test:unit:watch` (non-standard), `test:unit:coverage` (non-standard)
- ❌ Missing: `test`, `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`, `test:watch`, `test:coverage`
- Note: Has Playwright tests but uses non-standard naming

### ❌ Non-Compliant (2/13)

#### @atomiton/eslint-config

- Configuration package - may not need tests
- ❌ Missing: All test scripts

#### @atomiton/typescript-config

- Configuration package - may not need tests
- ❌ Missing: All test scripts

## Recommendations

### Immediate Actions Required

1. **High Priority Packages** (core functionality):
   - @atomiton/core
   - @atomiton/conductor
   - @atomiton/store
   - @atomiton/editor
   - @atomiton/nodes

2. **Medium Priority Packages** (supporting libraries):
   - @atomiton/di
   - @atomiton/events
   - @atomiton/hooks
   - @atomiton/storage

3. **Special Cases**:
   - @atomiton/ui - Rename existing scripts to match standards
   - @atomiton/eslint-config - Add no-op scripts or basic validation tests
   - @atomiton/typescript-config - Add no-op scripts or basic validation tests

### Template package.json Scripts Section

```json
{
  "scripts": {
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:smoke": "vitest run src/**/*.smoke.test.{ts,tsx}",
    "test:benchmark": "vitest bench --run",
    "test:e2e": "echo 'No E2E tests for this package'",
    "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark && pnpm test:e2e",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

### For UI Package (with Playwright)

```json
{
  "scripts": {
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:smoke": "vitest run src/**/*.smoke.test.{ts,tsx}",
    "test:benchmark": "vitest bench --run",
    "test:e2e": "playwright test",
    "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark && pnpm test:e2e",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Migration Priority

### Phase 1 (Critical - Week 1)

- [ ] @atomiton/core
- [ ] @atomiton/conductor
- [ ] @atomiton/store
- [ ] @atomiton/editor

### Phase 2 (Important - Week 2)

- [ ] @atomiton/nodes
- [ ] @atomiton/ui (standardize existing)
- [ ] @atomiton/di
- [ ] @atomiton/events

### Phase 3 (Supporting - Week 3)

- [ ] @atomiton/hooks
- [ ] @atomiton/storage
- [ ] @atomiton/eslint-config
- [ ] @atomiton/typescript-config

## Success Metrics

- 100% packages with standardized scripts
- Smoke tests run in < 5 seconds per package
- Benchmarks established for performance-critical code
- CI/CD pipeline uses standardized scripts
- Pre-commit hooks run smoke tests

## Next Steps

1. Create smoke tests for critical paths in each package
2. Add benchmark tests for performance-critical operations
3. Update CI/CD configuration to use standardized scripts
4. Add pre-commit hooks to run `test:smoke`
5. Document package-specific test requirements

---

_Generated: 2025-01-12_
_Status: Action Required_
_Compliance: 1/13 packages (7.7%)_
