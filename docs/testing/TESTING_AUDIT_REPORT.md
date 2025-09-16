# Testing Architecture Audit Report

Generated: 2025-01-16

## Executive Summary

This audit reviews the current testing implementation against documented standards in `TESTING_PHILOSOPHY.md`, `TESTING.md`, and `PACKAGE_TEST_SCRIPTS.md`.

### Key Findings

✅ **Strengths**

- Clear separation between smoke tests (Vitest) and critical user flows (Playwright)
- Proper `data-testid` convention documented and partially implemented
- Git hooks properly configured (pre-commit: smoke, pre-push: E2E)

⚠️ **Issues Found**

- Root package.json has too many test scripts (not following minimal standard)
- Package-level test scripts are inconsistent across packages
- Some packages missing required test scripts

## 1. Root Package.json Audit

### Current State (TOO MANY SCRIPTS)

The root package.json has 11 test-related scripts:

```json
"test": "turbo run test",
"test:unit": "turbo run test:unit",
"test:smoke": "turbo run test:smoke",
"test:benchmark": "turbo run test:benchmark",
"test:all": "turbo run test:all",
"test:watch": "turbo run test:watch",
"test:coverage": "turbo run test:coverage",
"test:e2e": "playwright test -c playwright/playwright.config.ts",
"test:e2e:smoke": "playwright test -c playwright/playwright.config.ts tests/smoke/",
"test:e2e:debug": "playwright test -c playwright/playwright.config.ts --debug",
"test:e2e:ui": "playwright test -c playwright/playwright.config.ts --ui",
"test:install": "playwright install chromium"
```

### Recommended Scripts (FOLLOWING STANDARD)

Per `PACKAGE_TEST_SCRIPTS.md`, root should only orchestrate:

```json
"test": "turbo run test",
"test:unit": "turbo run test:unit",
"test:smoke": "turbo run test:smoke",
"test:benchmark": "turbo run test:benchmark",
"test:all": "turbo run test:all",
"test:e2e": "playwright test -c playwright/playwright.config.ts"
```

**Action Required**: Remove redundant scripts:

- `test:watch` (package-level concern)
- `test:coverage` (package-level concern)
- `test:e2e:smoke` (duplicate of test:e2e with path)
- `test:e2e:debug` (can use --debug flag directly)
- `test:e2e:ui` (can use --ui flag directly)

## 2. Package-Level Test Script Compliance

### Standard Requirements (from PACKAGE_TEST_SCRIPTS.md)

All packages MUST have these 8 scripts:

1. `test` (default)
2. `test:unit`
3. `test:smoke`
4. `test:benchmark`
5. `test:e2e`
6. `test:all`
7. `test:watch`
8. `test:coverage`

### Package Compliance Status

#### ✅ @atomiton/store - COMPLIANT

Has all 8 required scripts properly implemented.

#### ✅ @atomiton/nodes - COMPLIANT

Has all 8 required scripts (test:watch missing but test watch works).

#### ⚠️ @atomiton/ui - PARTIALLY COMPLIANT

- Missing: `test:all`, `test:e2e`
- Non-standard: `test:unit:watch` instead of `test:watch`
- Non-standard: `test:unit:coverage` instead of `test:coverage`
- Has Playwright tests but wrong naming convention

#### ⚠️ @atomiton/client - NON-COMPLIANT

- Has 19 test scripts (way too many!)
- Non-standard scripts like `test:snapshots`, `test:debug`, etc.
- Should follow the 8-script standard

## 3. Testing Philosophy Alignment

### ✅ Correctly Implemented

1. **Smoke vs E2E Separation**:
   - Smoke tests use Vitest (fast, <5s)
   - E2E tests use Playwright (thorough, <30s)

2. **Git Hooks**:
   - Pre-commit runs smoke tests ✅
   - Pre-push runs E2E tests ✅

3. **data-testid Convention**:
   - Documented in TESTING_PHILOSOPHY.md ✅
   - Partially implemented in components

### ⚠️ Needs Improvement

1. **Test File Organization**:
   - Some packages have tests in `__tests__` instead of co-located
   - Smoke tests should be in `src/__tests__/smoke/` per TESTING.md

2. **Speed Requirements**:
   - Smoke tests MUST run in <5 seconds
   - Currently some integration tests are too slow

## 4. Recommendations

### Immediate Actions

1. **Simplify Root package.json**

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:smoke": "turbo run test:smoke",
    "test:e2e": "playwright test -c playwright/playwright.config.ts",
    "test:all": "turbo run test:all"
  }
}
```

2. **Standardize Package Scripts**
   Every package should have exactly these 8 scripts:

```json
{
  "scripts": {
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:smoke": "vitest run src/**/*.smoke.test.{ts,tsx}",
    "test:benchmark": "vitest bench",
    "test:e2e": "echo 'No E2E tests for this package'",
    "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

3. **Fix Test Organization**

- Move smoke tests to `src/__tests__/smoke/` in all packages
- Co-locate unit tests next to source files
- Remove scattered test directories

### Long-term Improvements

1. **Test Speed Monitoring**

- Add timing to smoke tests
- Fail if smoke tests exceed 5 seconds
- Move slow tests to integration suite

2. **Coverage Enforcement**

- Set minimum coverage requirements
- Block PR merges below thresholds
- Track coverage trends

3. **Test ID Implementation**

- Add `data-testid` to all interactive components
- Remove class/text selectors from tests
- Create ESLint rule for test ID enforcement

## 5. Compliance Matrix

| Package          | Scripts | Smoke Tests | data-testid | Co-location | Speed |
| ---------------- | ------- | ----------- | ----------- | ----------- | ----- |
| @atomiton/store  | ✅ 8/8  | ✅          | ⚠️          | ✅          | ✅    |
| @atomiton/nodes  | ✅ 8/8  | ✅          | ⚠️          | ✅          | ✅    |
| @atomiton/ui     | ⚠️ 6/8  | ⚠️          | ❌          | ⚠️          | ✅    |
| @atomiton/client | ❌ 19   | ⚠️          | ⚠️          | ⚠️          | ⚠️    |
| @atomiton/editor | ?       | ?           | ?           | ?           | ?     |
| @atomiton/form   | ?       | ?           | ?           | ?           | ?     |

## 6. Action Items

### High Priority

- [ ] Remove 6 redundant test scripts from root package.json
- [ ] Standardize @atomiton/ui test scripts
- [ ] Reduce @atomiton/client from 19 to 8 test scripts
- [ ] Move all smoke tests to `src/__tests__/smoke/`

### Medium Priority

- [ ] Add data-testid to all interactive components
- [ ] Ensure all smoke tests run in <5 seconds
- [ ] Implement coverage requirements

### Low Priority

- [ ] Add performance benchmarks where missing
- [ ] Create test data factories
- [ ] Document package-specific variations

## Conclusion

The testing architecture has good foundations with clear philosophy and standards documented. However, implementation is inconsistent across packages. The main issue is **script proliferation** - we have too many test scripts at both root and package levels, making the system complex and hard to maintain.

**Recommendation**: Enforce the 8-script standard strictly across all packages and simplify the root orchestration layer.

---

_Audit performed against: TESTING_PHILOSOPHY.md, TESTING.md, PACKAGE_TEST_SCRIPTS.md_
