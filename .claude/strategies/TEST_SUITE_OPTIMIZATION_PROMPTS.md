# Test Suite Optimization - Phase Prompts

**Reference:**
[TEST_SUITE_OPTIMIZATION_STRATEGY.md](./TEST_SUITE_OPTIMIZATION_STRATEGY.md)
**Execution:** Copy each phase prompt below and run sequentially

---

## Phase 1: Quick Wins (1-2 days)

**Impact:** 50-70% faster test execution **Status:** ✅ IMPLEMENTED

### Prompt

```
Implement Phase 1 (Quick Wins) from .claude/strategies/TEST_SUITE_OPTIMIZATION_STRATEGY.md:

1. Remove build dependency from unit tests:
   - Update turbo.json to create test:unit task with no dependsOn
   - Ensure proper inputs are defined

2. Consolidate test configurations:
   - Create packages/@atomiton/vite-config/vitest-presets.ts
   - Export unitTestPreset and integrationTestPreset
   - Update all vitest.config.ts files to use presets

3. Enable full Turborepo test caching:
   - Add .vitest-cache/** and test-results/** to outputs
   - Ensure cache is enabled

4. Parallelize E2E tests in CI:
   - Update playwright.config.ts workers to 3 in CI
   - Keep undefined for local development

Validate each change with:
- pnpm build
- pnpm test:unit (should run without build)
- pnpm test (should be faster with caching)

Update this file with ✅ IMPLEMENTED when complete.
```

---

## Phase 2: Structural Improvements (3-5 days)

**Impact:** 5-minute total CI time **Status:** ⏳ Pending

### Prompt

```
Implement Phase 2 (Structural Improvements) from .claude/strategies/TEST_SUITE_OPTIMIZATION_STRATEGY.md:

1. Implement test sharding strategy:
   - Add test:shard scripts to root package.json
   - Document shard usage in CI

2. Create test utilities package:
   - Populate packages/@atomiton/testing/ with:
     - factories/ (test data factories)
     - fixtures/ (reusable fixtures)
     - matchers/ (custom vitest matchers)
     - mocks/ (shared mocks)
     - setup/ (common setup utilities)

3. Split large integration test files:
   - Identify files >200 lines or >15 test cases
   - Refactor into focused test files (see section 2.3 for example)

4. Optimize E2E test startup:
   - Update playwright.config.ts webServer to reuse existing server
   - Set reuseExistingServer: true
   - Reduce timeout to 5000ms

Validate with:
- pnpm test --shard=1/3
- pnpm test:e2e (should start faster)
- Verify all tests pass

Update this file with ✅ IMPLEMENTED when complete.
```

---

## Phase 3: Advanced Optimizations (5-10 days)

**Impact:** Sub-minute local test runs **Status:** ⏳ Pending

### Prompt

```
Implement Phase 3 (Advanced Optimizations) from .claude/strategies/TEST_SUITE_OPTIMIZATION_STRATEGY.md:

1. Implement test prioritization:
   - Configure vitest sequence settings
   - Set critical path tests to run first

2. Add test tagging system:
   - Add @fast, @critical, @slow tags to tests
   - Create scripts: test:fast, test:critical, test:slow
   - Update git hooks to use tagged tests

3. Eliminate filesystem operations from tests:
   - Find tests using fs.readFileSync
   - Refactor to use virtual module mocking with vi.mock()

4. Integrate benchmark testing in CI:
   - Create .github/workflows/benchmark.yml
   - Add baseline comparison logic
   - Configure regression failure threshold

5. Implement smart test selection:
   - Add test:affected task to turbo.json
   - Configure to run only affected packages
   - Document usage in README

Validate with:
- pnpm test --tag=@fast (should complete in seconds)
- pnpm test:affected (should skip unchanged packages)
- pnpm test:benchmark (should run and compare)

Update this file with ✅ IMPLEMENTED when complete.
```

---

## Phase 4: Reliability & Resilience (Ongoing)

**Impact:** 99%+ test reliability **Status:** ⏳ Pending

### Prompt

```
Implement Phase 4 (Reliability & Resilience) from .claude/strategies/TEST_SUITE_OPTIMIZATION_STRATEGY.md:

1. Implement test retry strategy:
   - Configure retry: 2 in CI, 0 locally for vitest
   - Configure retries: 2 in CI, 1 locally for playwright
   - Add bail: 1 for fast local feedback

2. Add test health monitoring:
   - Create test-metrics.json generator
   - Track: totalTests, duration, flaky, slow, cached, executed
   - Set up dashboard or reporting mechanism

3. Strengthen E2E test isolation:
   - Add beforeEach/afterEach hooks with unique test IDs
   - Clear localStorage/sessionStorage between tests
   - Implement cleanup functions

4. Implement progressive test coverage:
   - Add test:coverage:80, test:coverage:90 scripts
   - Configure coverage.threshold.auto (ratchet pattern)
   - Ensure coverage never decreases

Validate with:
- Run tests multiple times to check retry behavior
- Check test-metrics.json is generated
- Verify E2E tests don't interfere with each other
- Confirm coverage thresholds enforce properly

Update this file with ✅ IMPLEMENTED when complete.
```

---

## Success Metrics

Track progress against these targets:

| Metric                    | Current | Target | Status |
| ------------------------- | ------- | ------ | ------ |
| Unit Tests (local)        | 60-90s  | 5-10s  | ⏳     |
| Integration Tests (local) | 120s    | 30s    | ⏳     |
| E2E Tests (CI)            | 15 min  | 5 min  | ⏳     |
| Full CI Pipeline          | 20 min  | 5 min  | ⏳     |
| Pre-commit Hook           | 45s     | 15s    | ⏳     |
| Cache Hit Rate            | ~40%    | 80%+   | ⏳     |

---

## Notes

- Execute phases sequentially
- Mark each phase with ✅ IMPLEMENTED when complete
- Update metrics table as improvements are verified
- Reference full strategy document for detailed context
