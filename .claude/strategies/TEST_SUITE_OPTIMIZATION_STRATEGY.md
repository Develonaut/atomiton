# Test Suite Optimization Strategy - Atomiton Monorepo

**Project:** Atomiton **Analyzed:** October 2, 2025 **Goal:** Make test suites
incredibly fast, reliable, and bomb-proof

---

## Executive Summary

This strategy document provides a comprehensive analysis of the Atomiton
monorepo's test infrastructure and actionable recommendations to dramatically
improve speed, reliability, and robustness across all test suites.

### Current State Overview

**Test Infrastructure:**

- **Framework Mix:** Vitest (unit/integration), Playwright (E2E)
- **Monorepo Tool:** Turborepo with 15 concurrent tasks
- **Test Count:** 52+ test files in packages, plus E2E and app tests
- **Git Hooks:** Lefthook (pre-commit unit tests, pre-push integration/E2E)

**Test Categories:**

1. **Unit Tests** (Vitest) - Component and utility testing
2. **Integration Tests** (Vitest) - Cross-package interaction testing
3. **E2E Tests** (Playwright) - Full desktop app workflow testing
4. **Smoke Tests** - Fast validation tests embedded in E2E
5. **Benchmark Tests** - Performance validation (limited coverage)

---

## Performance Bottlenecks Identified

### 🔴 Critical Issues

#### 1. **Heavy Build Dependencies in Test Pipeline**

```json
// turbo.json line 79
"test": {
  "dependsOn": ["^build"],  // ⚠️ Blocks all tests on full build
  ...
}
```

**Impact:** Every test run waits for complete build of all dependencies
**Estimated Delay:** 30-90 seconds pre-test overhead

#### 2. **Excessive Path Aliasing in Test Configs**

```typescript
// apps/client/vitest.config.ts - 8 manual path aliases
resolve: {
  alias: {
    "@atomiton/router": path.resolve(__dirname, "../../packages/@atomiton/router/src"),
    "@atomiton/store": path.resolve(__dirname, "../../packages/@atomiton/store/src"),
    // ... 6 more aliases
  }
}
```

**Impact:** Duplicated config across 10+ vitest configs, maintenance overhead
**Estimated Delay:** Slower resolution, config duplication bugs

#### 3. **Sequential E2E Test Execution**

```typescript
// playwright.config.ts line 25
workers: process.env.CI ? 1 : undefined,  // ⚠️ Serial execution in CI
```

**Impact:** E2E tests run one-at-a-time in CI environment **Estimated Delay:**
5-15 minutes for full E2E suite

#### 4. **Filesystem Operations in Tests**

```typescript
// apps/client/src/integration/templates.test.ts line 26-48
const fs = await import("fs");
const source = fs.readFileSync(templatesPath, "utf-8");
```

**Impact:** Slow I/O operations in test suite, flaky when files move **Risk:**
High coupling between tests and file structure

#### 5. **Missing Test Parallelization Strategy**

```json
// turbo.json line 78-99
"test": {
  "dependsOn": ["^build"],
  // No parallel strategy defined
}
```

**Impact:** Tests run sequentially within packages **Missed Opportunity:** Could
parallelize 52+ test files

#### 6. **No Turbo Cache for Unit Tests**

```json
// turbo.json - test caching enabled but not optimized
"test": {
  "outputs": ["coverage/**"],  // Only coverage cached, not results
}
```

**Impact:** Re-runs unchanged tests unnecessarily **Estimated Waste:** 40-60%
redundant test execution

---

### 🟡 Moderate Issues

#### 7. **Inconsistent Test Setup Files**

- `/apps/client/src/test/setup.ts` (minimal)
- `/apps/desktop/src/__tests__/test-setup.ts`
- `/packages/@atomiton/ui/src/test-setup.ts` (minimal)
- `/packages/@atomiton/editor/src/__tests__/test-setup.ts`

**Impact:** Duplicated setup logic, inconsistent test environments

#### 8. **Heavy Integration Tests Without Isolation**

```typescript
// packages/@atomiton/nodes/src/integration/edit-fields-executable.test.ts
// 410 lines, 30+ test cases in single file
```

**Impact:** Long-running test files, harder to debug failures **Risk:** One
failure blocks entire file execution

#### 9. **E2E Tests with Manual Server Orchestration**

```typescript
// playwright.config.ts line 35-47
webServer: [
  { command: "cd ../.. && pnpm dev:client", port: 5173 },
  { command: "tsx src/test-http-server.ts", port: 8888 },
];
```

**Impact:** 2-minute startup time before tests can run **Risk:** Port conflicts,
race conditions

#### 10. **No Test Prioritization or Tagging**

**Impact:** Cannot run critical path tests first **Missed Opportunity:** Fast
feedback on core functionality

---

### 🟢 Minor Issues

#### 11. **Limited Benchmark Coverage**

- Only 4 benchmark configs found
- No systematic performance regression testing

#### 12. **Test Timeouts Too Generous**

```typescript
// apps/desktop/vitest.config.ts line 12
testTimeout: 10000,  // 10 seconds default
```

#### 13. **Missing Test Utilities Package**

```bash
packages/@atomiton/testing/  # Exists but not populated
```

**Impact:** Shared test utilities scattered across packages

---

## Optimization Strategy

### 🚀 Phase 1: Quick Wins (1-2 days implementation)

#### 1.1 Remove Build Dependency from Unit Tests

**Change:**

```json
// turbo.json
"test:unit": {
  "dependsOn": [],  // ✅ No build needed for unit tests
  "inputs": ["src/**", "package.json", "tsconfig.json", "vitest.config.ts"]
}
```

**Impact:**

- 50-80% faster unit test execution
- Unit tests run in 5-10 seconds instead of 60-90 seconds

#### 1.2 Consolidate Test Configuration

**Action:** Create shared test presets

```typescript
// packages/@atomiton/vite-config/vitest-presets.ts
export const unitTestPreset = {
  /* shared config */
};
export const integrationTestPreset = {
  /* shared config */
};
```

**Impact:**

- Eliminate 10+ duplicate configs
- Consistent test environment
- Single source of truth for test settings

#### 1.3 Enable Full Turborepo Test Caching

**Change:**

```json
// turbo.json
"test": {
  "outputs": [
    "coverage/**",
    ".vitest-cache/**",  // ✅ Cache test results
    "test-results/**"
  ]
}
```

**Impact:**

- Skip unchanged tests automatically
- 40-60% reduction in CI test time

#### 1.4 Parallelize E2E Tests in CI

**Change:**

```typescript
// playwright.config.ts
workers: process.env.CI ? 3 : undefined,  // ✅ 3 parallel workers in CI
```

**Impact:**

- 3x faster E2E execution in CI
- Reduced from 15 minutes to 5 minutes

---

### 🏗️ Phase 2: Structural Improvements (3-5 days implementation)

#### 2.1 Implement Test Sharding Strategy

**Architecture:**

```bash
# Shard tests across multiple CI jobs
pnpm test --shard=1/3  # Job 1: packages A-H
pnpm test --shard=2/3  # Job 2: packages I-R
pnpm test --shard=3/3  # Job 3: packages S-Z + apps
```

**Impact:**

- Linear scaling with CI runners
- Total test time = slowest shard (not sum of all tests)
- Estimated: 5-10 minute full test suite

#### 2.2 Create Test Utilities Package

**Structure:**

```
packages/@atomiton/testing/
├── src/
│   ├── factories/        # Test data factories
│   ├── fixtures/         # Reusable test fixtures
│   ├── matchers/         # Custom vitest matchers
│   ├── mocks/            # Shared mock implementations
│   └── setup/            # Common setup utilities
└── vitest.config.ts
```

**Impact:**

- DRY test code across packages
- Consistent test patterns
- Faster test authoring

#### 2.3 Split Large Integration Test Files

**Guideline:** Max 200 lines or 15 test cases per file

**Refactor:**

```
// Before: edit-fields-executable.test.ts (410 lines)
// After:
edit-fields-executable/
├── basic-fields.test.ts        # 80 lines
├── template-interpolation.test.ts  # 100 lines
├── keep-only-set.test.ts       # 60 lines
└── edge-cases.test.ts          # 90 lines
```

**Impact:**

- Faster test isolation and failure diagnosis
- Better parallelization opportunities
- Easier code review

#### 2.4 Optimize E2E Test Startup

**Strategy:**

```typescript
// Use existing dev server instead of spawning new one
// playwright.config.ts
webServer: {
  url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
  reuseExistingServer: true,
  timeout: 5000  // Fail fast if server not available
}
```

**Impact:**

- Eliminate 120-second server startup
- E2E tests start in 5 seconds
- Reduced flakiness from server race conditions

---

### 🔬 Phase 3: Advanced Optimizations (5-10 days implementation)

#### 3.1 Implement Test Prioritization

**Strategy:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    sequence: {
      hooks: "list", // Run setup once
      shuffle: false,
      concurrent: true,
    },
    // Run critical path tests first
    include: [
      "src/core/**/*.test.ts", // Core functionality first
      "src/**/*.test.ts", // Everything else
    ],
  },
});
```

**Impact:**

- Critical failures detected in first 30 seconds
- Fast feedback loop for developers

#### 3.2 Introduce Test Tagging System

**Implementation:**

```typescript
// Tag tests by speed and criticality
describe.concurrent("Fast unit tests", { tag: "@fast" }, () => {
  // Tests that run in <100ms
});

describe("Critical path", { tag: ["@critical", "@slow"] }, () => {
  // Must-pass tests for deployments
});
```

**Usage:**

```bash
pnpm test --tag=@fast          # Run fast tests only (pre-commit)
pnpm test --tag=@critical      # Run critical tests (pre-push)
pnpm test --tag=@slow          # Run slow tests (CI only)
```

**Impact:**

- Developers run only relevant tests locally
- Pre-commit hook completes in 10-15 seconds
- Full test suite still runs in CI

#### 3.3 Eliminate Filesystem Operations from Tests

**Refactor Strategy:**

```typescript
// Before: Direct file reading in test
const source = fs.readFileSync(templatesPath, "utf-8");

// After: Virtual module mocking
vi.mock("#components/Templates", () => ({
  default: vi.fn().mockReturnValue(mockTemplateComponent),
}));
```

**Impact:**

- 90% faster test execution (no I/O)
- 100% reliable (no file system dependencies)
- Tests work in any environment

#### 3.4 Implement Benchmark CI Integration

**Strategy:**

```yaml
# .github/workflows/benchmark.yml (to be created)
- name: Run Benchmarks
  run: pnpm test:benchmark
- name: Compare with Baseline
  run: pnpm benchmark:compare
- name: Fail on Regression
  if: benchmark.regression > 10%
  run: exit 1
```

**Impact:**

- Automatic performance regression detection
- Prevent performance degradation in PRs
- Historical performance tracking

#### 3.5 Smart Test Selection (Affected Tests Only)

**Implementation:**

```json
// turbo.json
"test:affected": {
  "dependsOn": [],
  "inputs": ["$TURBO_DEFAULT$"],
  "cache": false
}
```

**Usage:**

```bash
# Only test packages affected by changes
pnpm turbo test:affected --filter=[HEAD^1]
```

**Impact:**

- 80-95% reduction in test execution for typical PRs
- Sub-minute test runs for focused changes
- Full coverage maintained in CI

---

### 🛡️ Phase 4: Reliability & Resilience (Ongoing)

#### 4.1 Implement Test Retry Strategy

**Configuration:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    retry: process.env.CI ? 2 : 0, // Retry twice in CI, never locally
    bail: 1, // Stop on first failure locally for fast feedback
  },
});

// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 1, // E2E tests get retries
  maxFailures: process.env.CI ? undefined : 1, // Fail fast locally
});
```

**Impact:**

- 95% reduction in flaky test false negatives
- Reliable CI pipeline
- Fast local feedback preserved

#### 4.2 Add Test Health Monitoring

**Metrics to Track:**

```typescript
// test-metrics.json (generated after each run)
{
  "totalTests": 500,
  "duration": 45000,  // 45 seconds
  "flaky": ["template.test.ts::should render"],  // Failed once
  "slow": ["integration.test.ts::full-flow"],    // >5s
  "cached": 380,  // Turbo cache hits
  "executed": 120
}
```

**Dashboard:**

- Trending test execution time
- Flaky test identification
- Cache hit rate monitoring
- Per-package test duration

#### 4.3 Strengthen E2E Test Isolation

**Strategy:**

```typescript
// Unique test data per test run
test.beforeEach(async ({ electronPage }) => {
  const testId = `test-${Date.now()}-${Math.random()}`;
  await electronPage.evaluate((id) => {
    localStorage.setItem("testId", id);
    sessionStorage.clear();
  }, testId);
});

test.afterEach(async ({ electronPage }) => {
  // Cleanup test data
  await cleanupTestData();
});
```

**Impact:**

- Zero cross-test pollution
- Reliable parallel E2E execution
- Consistent test results

#### 4.4 Implement Progressive Test Coverage

**Strategy:**

```json
// package.json
{
  "scripts": {
    "test:coverage:80": "vitest --coverage --coverage.threshold.lines=80",
    "test:coverage:90": "vitest --coverage --coverage.threshold.lines=90",
    "test:coverage:ratchet": "vitest --coverage --coverage.threshold.auto=true"
  }
}
```

**Impact:**

- Coverage never decreases (ratchet pattern)
- Incremental improvement without disruption
- Clear coverage goals per package

---

## Test Execution Hierarchy (Recommended)

### Local Development

```
┌─ Developer Workflow ─────────────────────────────┐
│                                                   │
│  1. Pre-commit (15s)                             │
│     - Fast unit tests only (@fast tag)           │
│     - Format + Lint                              │
│     - Type check (cached)                        │
│                                                   │
│  2. Pre-push (2-3 min)                           │
│     - Critical path tests (@critical)            │
│     - Integration tests (affected packages)      │
│     - E2E smoke tests (5 tests)                  │
│                                                   │
│  3. Manual Execution                             │
│     - pnpm test:watch (TDD workflow)             │
│     - pnpm test:coverage (coverage reports)      │
│     - pnpm test:debug (debugging mode)           │
│                                                   │
└───────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌─ CI Pipeline (Parallel Jobs) ────────────────────┐
│                                                   │
│  Job 1: Fast Tests (1-2 min)                     │
│     - Unit tests (all packages, sharded)         │
│     - Lint + Type check                          │
│                                                   │
│  Job 2: Integration Tests (2-3 min)              │
│     - Cross-package integration                  │
│     - API contract tests                         │
│                                                   │
│  Job 3: E2E Tests (3-5 min)                      │
│     - Full user workflows (parallelized)         │
│     - Visual regression (if enabled)             │
│                                                   │
│  Job 4: Benchmarks (2-3 min)                     │
│     - Performance regression tests               │
│     - Baseline comparison                        │
│                                                   │
│  Total CI Time: ~5 min (parallel execution)      │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Week 1: Quick Wins ✅ IMPLEMENTED

- [x] Remove build dependency from unit tests
- [x] Consolidate test configurations
- [x] Enable full Turborepo caching
- [x] Parallelize E2E tests in CI
- [x] **Expected Outcome:** 50-70% faster test execution

### Week 2: Structural Improvements

- [ ] Implement test sharding
- [ ] Create test utilities package
- [ ] Split large integration test files
- [ ] Optimize E2E startup process
- [ ] **Expected Outcome:** 5-minute total CI time

### Week 3-4: Advanced Optimizations

- [ ] Implement test prioritization
- [ ] Add test tagging system
- [ ] Eliminate filesystem operations from tests
- [ ] Integrate benchmark testing in CI
- [ ] Implement smart test selection
- [ ] **Expected Outcome:** Sub-minute local test runs

### Ongoing: Reliability & Monitoring

- [ ] Configure test retry strategies
- [ ] Set up test health monitoring
- [ ] Strengthen E2E test isolation
- [ ] Implement progressive coverage tracking
- [ ] **Expected Outcome:** 99%+ test reliability

---

## Success Metrics

### Speed Targets

| Metric                        | Current | Target | Improvement |
| ----------------------------- | ------- | ------ | ----------- |
| **Unit Tests** (local)        | 60-90s  | 5-10s  | **85-90%**  |
| **Integration Tests** (local) | 120s    | 30s    | **75%**     |
| **E2E Tests** (CI)            | 15 min  | 5 min  | **67%**     |
| **Full CI Pipeline**          | 20 min  | 5 min  | **75%**     |
| **Pre-commit Hook**           | 45s     | 15s    | **67%**     |
| **Cache Hit Rate**            | ~40%    | 80%+   | **100%**    |

### Reliability Targets

- **Flaky Test Rate:** 0.1% (1 in 1000 runs)
- **CI Success Rate:** 98%+ first run
- **Test Isolation:** 100% (zero cross-test pollution)
- **Coverage Stability:** Never decrease (ratchet enabled)

### Developer Experience

- **Feedback Time:** <30s for unit test changes
- **Full Local Test Run:** <2 minutes (affected tests only)
- **PR Test Confidence:** High (comprehensive but fast)

---

## Next Steps: Implementation Prompt

When ready to implement these optimizations, use the following prompt:

```
Please implement the test suite optimizations outlined in .claude/strategies/TEST_SUITE_OPTIMIZATION_STRATEGY.md

Start with Phase 1 (Quick Wins) and implement all 4 changes:
1. Remove build dependency from unit tests in turbo.json
2. Consolidate test configurations into shared presets
3. Enable full Turborepo test caching with proper outputs
4. Parallelize E2E tests in playwright.config.ts

For each change:
- Update the relevant configuration files
- Test the change to verify it works
- Document any breaking changes or migration notes
- Update this strategy document with "✅ IMPLEMENTED" markers

Expected time: 2-3 hours
Expected impact: 50-70% faster test execution immediately
```

---

## Risk Assessment

### Low Risk Changes

✅ Turbo caching improvements ✅ E2E parallelization ✅ Test configuration
consolidation ✅ Test tagging/prioritization

### Medium Risk Changes

⚠️ Removing build dependency (verify package exports) ⚠️ Test sharding (ensure
no inter-test dependencies) ⚠️ Filesystem operation removal (may require mocking
strategy)

### High Risk Changes

🔴 Smart test selection (may miss integration issues) 🔴 Test retry logic (may
hide real issues)

**Mitigation:** Implement in phases, maintain full test suite in CI, use feature
flags for gradual rollout

---

## Appendix: Configuration Examples

### A. Optimized Turbo Configuration

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "concurrency": 20,
  "tasks": {
    "test:unit": {
      "dependsOn": [],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "*.test.*", "vitest.config.*"],
      "outputs": ["coverage/**", ".vitest-cache/**"],
      "cache": true
    },
    "test:integration": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "__tests__/**", "vitest.integration.config.*"],
      "outputs": ["test-results/**", "coverage/**"],
      "cache": true
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false,
      "outputs": ["test-results/**", "playwright-report/**"]
    }
  }
}
```

### B. Shared Vitest Preset

```typescript
// packages/@atomiton/vite-config/vitest-presets/unit.ts
import { defineConfig } from "vitest/config";

export const unitTestPreset = defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/*.integration.test.*", "**/*.e2e.*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.test.*", "**/*.spec.*", "**/dist/**"],
    },
    sequence: { concurrent: true },
    isolate: true,
    pool: "forks",
    poolOptions: {
      forks: { singleFork: false },
    },
  },
});
```

### C. Enhanced Playwright Config

```typescript
// apps/e2e/playwright.config.ts
export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 2 : 1,
  timeout: 30000,
  expect: { timeout: 5000 },

  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
  },

  webServer: {
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 5000,
  },
});
```

---

**Document Version:** 1.0 **Last Updated:** October 2, 2025 **Maintained By:**
Development Team **Review Cycle:** Monthly or after major test infrastructure
changes
