# Testing Migration Prompt

## Purpose

This prompt should be used to systematically review and update all packages in the Atomiton monorepo to follow the testing strategy defined in TESTING_STRATEGY.md.

---

## PROMPT FOR CLAUDE/AGENT

**Task**: Review and migrate all packages in the Atomiton monorepo to follow the new testing strategy

**Context**:
We've established a new testing strategy that emphasizes test isolation, removes build dependencies from unit/smoke tests, and avoids shared mock utilities. Your task is to systematically review each package and update its testing setup.

**Required Reading First**:

1. Read `/docs/testing/TESTING_STRATEGY.md` for the complete testing philosophy
2. Review the updated `turbo.json` to understand the test task configurations

**Systematic Review Process**:

### Phase 1: Audit Current State

For each package in `/packages/@atomiton/*` and `/apps/*`:

1. **Check for test utilities exports**:
   - Look for `/testing`, `/test-utils`, or `/mocks` exports in package.json
   - Identify any exported mock factories or test helpers
   - Document which packages are consuming these utilities

2. **Analyze test dependencies**:
   - Review what's being imported in test files
   - Identify tests that import built packages vs source code
   - Find tests that use shared mocks from other packages

3. **Categorize existing tests**:
   - Smoke tests (should be <10s, no dependencies)
   - Unit tests (should mock at boundaries)
   - Integration tests (may use real implementations)
   - Contract tests (verify interface compliance)

### Phase 2: Remove Anti-patterns

For each package:

1. **Remove test utility exports**:

   ```json
   // Remove from package.json exports:
   "./testing": "./dist/testing.js"
   "./test-utils": "./dist/test-utils.js"
   ```

2. **Delete shared mock files**:
   - Remove `src/testing/*` directories
   - Remove `src/mocks/*` that export utilities
   - Keep `__mocks__/` for vi.mock() usage only

3. **Update import statements**:

   ```typescript
   // ❌ Remove:
   import { createMockStorage } from "@atomiton/storage/testing";

   // ✅ Replace with:
   vi.mock("@atomiton/storage/desktop", () => ({
     createStorage: vi.fn(() => ({
       load: vi.fn().mockResolvedValue({}),
       save: vi.fn().mockResolvedValue(void 0),
     })),
   }));
   ```

### Phase 3: Implement Correct Patterns

1. **Update smoke tests**:
   - Ensure they test only initialization
   - Remove any build dependencies
   - Mock all external packages
   - Verify execution time <10s

2. **Update unit tests**:
   - Mock at import boundaries using vi.mock()
   - Test against source code, not dist
   - Remove integration-style tests to separate files

3. **Create integration test suites**:

   ```typescript
   // New file: storage.integration.test.ts
   import { createStorage } from "@atomiton/storage/desktop";
   import { createConductor } from "@atomiton/conductor/desktop";

   describe("Storage-Conductor Integration", () => {
     // Use real implementations with test configs
   });
   ```

4. **Add contract tests** where appropriate:
   ```typescript
   // New file: storage.contract.test.ts
   describe("Storage Contract", () => {
     const implementations = [
       /* all implementations */
     ];
     // Test each against same interface
   });
   ```

### Phase 4: Update Configuration

1. **Update package.json scripts**:

   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:smoke": "vitest run src/**/*.smoke.test.ts",
       "test:unit": "vitest run src/**/*.test.ts --exclude '**/*.smoke.test.ts' --exclude '**/*.integration.test.ts'",
       "test:integration": "vitest run src/**/*.integration.test.ts",
       "test:contract": "vitest run src/**/*.contract.test.ts"
     }
   }
   ```

2. **Update vitest.config.ts**:
   - Enable clearMocks, mockReset, restoreMocks
   - Configure proper test file patterns
   - Set appropriate timeouts for each test type

### Phase 5: Verify Migration

For each package, verify:

1. **Smoke tests**:
   - [ ] Run in <10 seconds
   - [ ] No build dependencies
   - [ ] Test only initialization

2. **Unit tests**:
   - [ ] Mock at boundaries
   - [ ] No shared mock utilities
   - [ ] Test source code directly

3. **Integration tests**:
   - [ ] Use real implementations
   - [ ] Test cross-package interactions
   - [ ] Use in-memory/test configurations

4. **No test utilities exported**:
   - [ ] package.json has no test-related exports
   - [ ] No shared mock factories
   - [ ] No test helper utilities exported

### Packages to Review

Start with these packages in order of importance:

1. **Core packages** (update first as others depend on them):
   - [ ] @atomiton/storage
   - [ ] @atomiton/events
   - [ ] @atomiton/store
   - [ ] @atomiton/nodes

2. **Execution packages**:
   - [ ] @atomiton/conductor
   - [ ] @atomiton/di

3. **UI packages**:
   - [ ] @atomiton/ui
   - [ ] @atomiton/editor
   - [ ] @atomiton/form

4. **Utility packages**:
   - [ ] @atomiton/utils
   - [ ] @atomiton/validation
   - [ ] @atomiton/yaml
   - [ ] @atomiton/router
   - [ ] @atomiton/hooks

5. **Config packages**:
   - [ ] @atomiton/vite-config
   - [ ] @atomiton/eslint-config
   - [ ] @atomiton/typescript-config

6. **Applications**:
   - [ ] apps/client
   - [ ] apps/desktop

### Expected Outcome

After migration:

- All tests run faster (smoke tests <10s total)
- No shared mock utilities exist
- Tests are properly categorized
- Build dependencies removed from unit/smoke tests
- Integration tests use real implementations
- Contract tests verify interfaces

### Success Metrics

Track these improvements:

- Smoke test execution time: Target <10s (currently ~17s)
- Unit test execution time: Target <5s per package
- Build dependencies: 0 for unit/smoke tests
- Shared mock exports: 0 across all packages
- Test categorization: 100% properly categorized

### Special Considerations

1. **For packages with no tests yet**: Create minimal smoke tests first
2. **For config packages**: May only need smoke tests
3. **For apps**: May need build dependencies for E2E tests only
4. **For heavily mocked packages**: Gradually migrate to integration tests

### Reporting

After reviewing each package, document:

1. What anti-patterns were found
2. What changes were made
3. Test execution time improvements
4. Any issues or blockers encountered

---

## USAGE

To use this prompt:

1. Copy the entire prompt above
2. Provide it to Claude or an AI agent
3. Add: "Please start with [package name] and work through the migration process"
4. Review and approve changes before moving to the next package

The migration should be done incrementally, one package at a time, to ensure stability and allow for validation at each step.
