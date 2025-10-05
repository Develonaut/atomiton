# Test Tagging and Filtering Guide

## Overview

With Vitest 3.x, tests can be filtered and tagged using built-in features
without custom infrastructure.

## Filtering Methods

### 1. By File Pattern

```bash
# Run only unit tests
pnpm test -- src/**/*.test.ts

# Run only integration tests
pnpm test -- src/**/integration/**

# Run specific package tests
pnpm --filter @atomiton/conductor test
```

### 2. By Test Name (grep)

```bash
# Run tests matching pattern
pnpm test -- -t "progress"

# Run critical tests (by naming convention)
pnpm test -- -t "critical:"

# Exclude slow tests
pnpm test -- -t "^(?!.*slow).*$"
```

### 3. Using test.skip/test.only

```typescript
import { describe, test, it } from "vitest";

// Mark slow tests to skip by default
test.skip("slow: performance test with 10000 items", () => {
  // Skipped unless --run-skipped flag used
});

// Mark critical tests
test("critical: user authentication flow", () => {
  // Always runs
});

// Run only this test during debugging
test.only("debug: investigating this issue", () => {
  // Only this test runs
});
```

### 4. Using describe.skip/describe.only

```typescript
// Skip entire test suite
describe.skip("Performance Tests", () => {
  // All tests in this block are skipped
});

// Run only this suite
describe.only("Critical Path", () => {
  // Only tests in this block run
});
```

## Naming Conventions

Use prefixes in test names for semantic filtering:

- `critical:` - Must pass for deployments
- `slow:` - Tests that take >1s
- `flaky:` - Known unstable tests (investigate/fix these!)
- `integration:` - Integration tests
- `unit:` - Unit tests
- `e2e:` - End-to-end tests

## Examples

### Run Only Critical Tests (Fast Feedback)

```bash
# Using npm script (recommended)
pnpm test:critical

# Manual filter (per package)
pnpm --filter @atomiton/conductor test -- -t "critical:"
```

### Run Only Slow Tests

```bash
# Using npm script (recommended)
pnpm test:slow

# Manual filter
pnpm test -- -t "slow:"
```

### Skip Slow Tests (Fast CI)

```bash
# Using npm script (recommended)
pnpm test:fast

# Manual filter
pnpm test -- -t "^(?!.*slow).*$"
```

### Run Only Skipped Tests

```bash
pnpm test -- --run-skipped
```

### Watch Mode for Specific Tests

```bash
pnpm --filter @atomiton/conductor test:watch -- -t "progress"
```

## CI Configuration

See `.github/workflows/test.yml.template` for a complete example.

### Quick CI Setup

```yaml
# Fast feedback - critical tests first (fail fast)
- name: Critical Tests
  run: pnpm test:critical

# Full suite (runs after critical pass)
- name: All Tests
  run: pnpm test
  if: steps.critical.conclusion == 'success'

# Performance tests (separate job, parallel)
- name: Performance Tests
  run: pnpm test:slow
```

### Available NPM Scripts

- `pnpm test:critical` - Run only critical path tests (~29 tests, <5s)
- `pnpm test:slow` - Run only slow performance tests (~5 tests, ~2s)
- `pnpm test:fast` - Run all tests except slow ones
- `pnpm test:changed` - Run tests for changed packages (uses Turbo filtering)
- `pnpm test:perf` - Track performance vs baseline (uses Vitest JSON reporter)
- `pnpm test:perf:baseline` - Save current performance as baseline
- `pnpm test` - Run all tests (full suite)

### Built-in Tool Features

**Smart Test Selection:** Uses Turbo's built-in `--filter="...[origin/main]"` to
automatically detect and test only changed packages.

**Performance Tracking:** Uses Vitest's native `--reporter=json` output for
metrics - no custom parsing needed.

## Current Usage

**Status: Implemented ✅**

### Tagged Tests (34 total)

**Critical Tests (29):**

- `conductor/src/execution/dataFlow.test.ts` - 4 tests
- `conductor/src/execution/executionGraphStore.test.ts` - 9 tests
- `conductor/src/exports/browser/index.test.ts` - 2 tests
- `nodes/src/graph/graphAnalyzer.test.ts` - 5 tests
- `nodes/src/core/utils/createFieldsFromSchema.test.ts` - 6 tests
- `storage/src/storageFactory.test.ts` - 3 tests

**Slow Tests (5):**

- `conductor/src/execution/slowMo.test.ts` - 3 tests (timing-based)
- `conductor/src/execution/asyncProgress.test.ts` - 2 tests (100+ nodes)

### Performance Impact

- **Critical tests only:** 15 tests in ~12ms (conductor package)
- **Slow tests only:** 5 tests in ~1.6s
- **Full suite:** All tests with Turborepo cache

### Implementation Complete

1. ✅ Tag critical tests (29 tests)
2. ✅ Tag slow tests (5 tests)
3. ✅ Add npm scripts (using built-in tool features)
4. ✅ Create and activate CI workflow
5. ✅ Set up performance tracking (Vitest JSON reporter)
6. ✅ Smart test selection (Turbo filtering)

### Key Principle

**"The framework already solved this"** - We use Vitest's `--reporter=json` and
Turbo's `--filter` instead of custom implementations.

## Migration Path

1. Start with critical tests: `test('critical: ...', ...)`
2. Mark slow tests: `test.skip('slow: ...', ...)`
3. Use CI to run critical first, then full suite
4. Remove `flaky:` tests by fixing them!
