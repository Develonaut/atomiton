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

### Run Only Critical Tests

```bash
pnpm test -- -t "critical:"
```

### Skip Slow Tests in CI

```bash
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

In `.github/workflows/test.yml`:

```yaml
# Fast feedback - critical tests only
- name: Critical Tests
  run: pnpm test -- -t "critical:"

# Full suite
- name: All Tests
  run: pnpm test

# Performance tests (separate job)
- name: Performance Tests
  run: pnpm test -- -t "slow:"
```

## Current Usage

No tests currently use the tagging system. To adopt:

1. Identify critical path tests (auth, data integrity, etc.)
2. Add `critical:` prefix to those test names
3. Mark known slow tests with `slow:` prefix or test.skip
4. Update CI to run critical tests first for fast feedback

## Migration Path

1. Start with critical tests: `test('critical: ...', ...)`
2. Mark slow tests: `test.skip('slow: ...', ...)`
3. Use CI to run critical first, then full suite
4. Remove `flaky:` tests by fixing them!
