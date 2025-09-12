# Standardized Package Test Scripts

## Overview

All packages in the Atomiton monorepo should implement a consistent set of test scripts to ensure quality, performance, and maintainability across the codebase. This standardization enables efficient CI/CD pipelines and provides developers with predictable testing workflows.

## Required Test Scripts

Every package must include the following test scripts in their `package.json`:

### 1. `test:unit`

**Purpose**: General unit testing for I/O, functions, and isolated components  
**Framework**: Vitest (preferred)  
**Characteristics**:

- Tests individual units in isolation
- Mocks external dependencies
- Fast execution (< 100ms per test)
- High coverage targets (80%+ for critical paths)

```json
"test:unit": "vitest run"
```

### 2. `test:smoke`

**Purpose**: Mission-critical tests for pre-commit validation  
**Framework**: Vitest  
**Characteristics**:

- Small, concise, and fast (< 5 seconds total)
- Tests only critical paths
- Acts as canary in the coal mine
- Should NEVER be skipped
- Blocks commits on failure

```json
"test:smoke": "vitest run src/**/*.smoke.test.{ts,tsx}"
```

### 3. `test:benchmark`

**Purpose**: Performance testing to catch degradation  
**Framework**: Vitest with benchmark plugin or custom tooling  
**Characteristics**:

- Benchmarks critical operations
- Tracks performance over time
- Fails on significant regression (> 10% degradation)
- Runs with consistent datasets

```json
"test:benchmark": "vitest bench"
```

### 4. `test:e2e`

**Purpose**: End-to-end testing for complete workflows  
**Framework**: Playwright (when applicable)  
**Characteristics**:

- Tests complete user journeys
- Runs in real browser environments
- Can be no-op for libraries without UI
- Located in package's `e2e/` directory

```json
"test:e2e": "echo 'No E2E tests for this package'"
```

or

```json
"test:e2e": "playwright test"
```

### 5. `test:all`

**Purpose**: Comprehensive test suite for major changes  
**Framework**: All of the above  
**Characteristics**:

- Runs all test suites sequentially
- Used for release validation
- Not for everyday development
- Provides complete confidence

```json
"test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark && pnpm test:e2e"
```

### 6. `test` (default)

**Purpose**: Default test command for everyday development  
**Framework**: Vitest  
**Characteristics**:

- Typically maps to `test:unit`
- What developers run most often
- Used by CI/CD pipelines

```json
"test": "pnpm test:unit"
```

### 7. `test:watch`

**Purpose**: Development mode testing  
**Framework**: Vitest  
**Characteristics**:

- Watches for file changes
- Re-runs affected tests
- Provides instant feedback

```json
"test:watch": "vitest watch"
```

### 8. `test:coverage`

**Purpose**: Generate test coverage reports  
**Framework**: Vitest with coverage  
**Characteristics**:

- Generates detailed coverage reports
- Tracks coverage over time
- Identifies untested code paths

```json
"test:coverage": "vitest run --coverage"
```

## File Naming Conventions

### Test File Patterns

- **Unit tests**: `*.test.ts` or `*.test.tsx`
- **Smoke tests**: `*.smoke.test.ts` or `*.smoke.test.tsx`
- **Benchmark tests**: `*.bench.ts` or `*.benchmark.test.ts`
- **E2E tests**: `*.e2e.test.ts` or `*.spec.ts`

### Directory Structure

```
packages/[package-name]/
├── src/
│   ├── utils/
│   │   ├── helper.ts
│   │   ├── helper.test.ts           # Unit test
│   │   └── helper.smoke.test.ts     # Smoke test
│   └── __benchmarks__/
│       └── performance.bench.ts     # Benchmark tests
├── e2e/
│   └── workflows.e2e.test.ts        # E2E tests
└── package.json
```

## Implementation Examples

### Example package.json Scripts Section

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -p tsconfig.json --watch",
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:smoke": "vitest run src/**/*.smoke.test.{ts,tsx}",
    "test:benchmark": "vitest bench",
    "test:e2e": "echo 'No E2E tests for this package'",
    "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark && pnpm test:e2e",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

### Smoke Test Example

```typescript
// src/core/engine.smoke.test.ts
import { describe, it, expect } from "vitest";
import { createEngine, executeBlueprint } from "./engine";

describe("Engine Smoke Tests", () => {
  it("creates engine instance", () => {
    const engine = createEngine();
    expect(engine).toBeDefined();
  });

  it("executes basic blueprint", async () => {
    const engine = createEngine();
    const result = await executeBlueprint(engine, { nodes: [] });
    expect(result.success).toBe(true);
  });
});
```

### Benchmark Test Example

```typescript
// src/__benchmarks__/parser.bench.ts
import { bench, describe } from "vitest";
import { parseBlueprint } from "../parser";
import { largeBlueprintFixture } from "./fixtures";

describe("Blueprint Parser Performance", () => {
  bench("parse small blueprint (10 nodes)", () => {
    parseBlueprint(smallFixture);
  });

  bench("parse large blueprint (1000 nodes)", () => {
    parseBlueprint(largeBlueprintFixture);
  });
});
```

## Turbo Configuration

Configure Turborepo to leverage these standardized scripts:

```json
// turbo.json
{
  "pipeline": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:smoke": {
      "cache": false
    },
    "test:benchmark": {
      "dependsOn": ["^build"],
      "outputs": ["benchmark-results/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false
    },
    "test:all": {
      "dependsOn": ["build"],
      "cache": false
    }
  }
}
```

## CI/CD Integration

### Pre-commit Hook

```bash
# Run smoke tests before allowing commit
pnpm turbo test:smoke --filter=[affected]
```

### Pull Request Pipeline

```yaml
# Run unit tests and smoke tests
- run: pnpm turbo test:unit test:smoke --filter=[affected]
```

### Pre-merge Pipeline

```yaml
# Run comprehensive tests
- run: pnpm turbo test:all --filter=[affected]
```

### Nightly Pipeline

```yaml
# Run benchmarks and track performance
- run: pnpm turbo test:benchmark
- run: pnpm analyze-benchmarks
```

## Migration Checklist

When updating a package to follow these standards:

- [ ] Add all required test scripts to package.json
- [ ] Create smoke tests for critical paths
- [ ] Set up benchmark tests for performance-critical code
- [ ] Configure E2E tests or add no-op placeholder
- [ ] Update test file names to follow conventions
- [ ] Verify all scripts execute correctly
- [ ] Update CI/CD configurations if needed
- [ ] Document any package-specific variations

## Package-Specific Variations

While standardization is important, some packages may require variations:

### Libraries without UI

- `test:e2e` can be a no-op
- Focus on comprehensive unit and integration tests

### UI Component Libraries

- `test:e2e` might test component interactions
- Consider visual regression tests

### Core Engine Packages

- Extensive benchmark tests required
- Smoke tests should cover all critical operations

### Applications

- Full E2E test suites required
- Smoke tests should cover user authentication and core workflows

## Best Practices

1. **Keep smoke tests minimal**: If smoke tests take > 5 seconds, move tests to unit suite
2. **Benchmark consistently**: Always use the same data sets and environment
3. **Document variations**: If a package deviates from standards, document why
4. **Fail fast**: Smoke tests should catch obvious breaks immediately
5. **Monitor trends**: Track benchmark results over time, not just pass/fail

---

_Last Updated: 2025-01-12_  
_Version: 1.0.0_  
_Status: Active Standard_
