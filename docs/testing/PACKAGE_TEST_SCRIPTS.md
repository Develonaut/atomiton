# Package Testing Guide

## Required for Every Package

Every Atomiton package MUST implement the standardized testing structure and scripts defined below.

## 1. Test Scripts (Exactly 8 Required)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:smoke": "vitest run src/__tests__/smoke",
    "test:benchmark": "vitest bench --run || echo 'No benchmarks yet'",
    "test:e2e": "playwright test || echo 'No E2E tests for this package'",
    "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark && pnpm test:e2e",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 2. Folder Structure

```
packages/@atomiton/[your-package]/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx       # Unit tests co-located
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── __tests__/
│   │       └── helpers.test.ts       # Unit tests co-located
│   └── __tests__/
│       ├── smoke/                    # Package smoke tests
│       │   ├── api.smoke.test.ts     # Test public API
│       │   └── critical.smoke.test.ts # Critical paths
│       ├── integration/              # Integration tests
│       │   └── workflow.test.ts
│       └── benchmark/                # Performance tests
│           └── performance.bench.ts
├── benchmarks/                       # Benchmark data
│   ├── baseline.json                 # Current baseline
│   └── latest.json                   # Latest results
├── test-results/                     # Test timing data
│   └── speed-report.json
└── vitest.config.ts                  # Test configuration
```

## 3. Test Types & Requirements

### Smoke Tests (REQUIRED)

- **Location**: `src/__tests__/smoke/`
- **Time Limit**: <5 seconds total
- **Purpose**: Critical path validation
- **When Run**: Every commit (blocking)

```typescript
// src/__tests__/smoke/api.smoke.test.ts
import { describe, it, expect } from "vitest";
import * as API from "../../index";

describe("Package API Smoke Tests", () => {
  it("exports required functions", () => {
    expect(API.mainFunction).toBeDefined();
    expect(typeof API.mainFunction).toBe("function");
  });

  it("critical path works", () => {
    const result = API.mainFunction(validInput);
    expect(result).toBeDefined();
  });
});
```

### Unit Tests

- **Location**: Co-located in `__tests__` folders
- **Time Limit**: <100ms each
- **Coverage Target**: 80% for critical code

```typescript
// src/utils/__tests__/helpers.test.ts
import { describe, it, expect } from "vitest";
import { formatDate, parseInput } from "../helpers";

describe("Helper Functions", () => {
  it("formats date correctly", () => {
    expect(formatDate(new Date("2025-01-01"))).toBe("Jan 1, 2025");
  });
});
```

### Benchmark Tests

- **Location**: `src/__tests__/benchmark/`
- **Regression Limit**: 10% degradation blocks PR
- **Baseline**: Update quarterly or with major changes

```typescript
// src/__tests__/benchmark/performance.bench.ts
import { bench, describe } from "vitest";
import { processLargeDataset } from "../processor";

describe("Performance Benchmarks", () => {
  bench("process 100 items", () => {
    processLargeDataset(smallDataset);
  });

  bench("process 10,000 items", () => {
    processLargeDataset(largeDataset);
  });
});
```

## 4. Performance Tracking

### Setting Up Baselines

```bash
# Run benchmarks
pnpm benchmark:run

# Review results
pnpm benchmark:compare

# If improvements, update baseline
pnpm benchmark:update
```

### Speed Monitoring

```bash
# Check test speed
pnpm test:speed

# View dashboard
pnpm test:dashboard
```

## 5. Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // or 'jsdom' for UI packages
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.test.ts", "**/__tests__/**"],
    },
    benchmark: {
      outputFile: "./benchmarks/latest.json",
    },
    reporters: ["default", "json"],
    outputFile: "./test-results/speed-report.json",
  },
});
```

## 6. Pre-commit Checklist

Before committing, ensure:

- [ ] All 8 test scripts present in package.json
- [ ] Smoke tests in `src/__tests__/smoke/`
- [ ] Unit tests in co-located `__tests__` folders
- [ ] Smoke tests complete in <5 seconds
- [ ] No test files mixed with source files

## 7. Common Patterns

### Testing Exports

```typescript
// Always test your public API
import * as Package from "../index";

describe("Package Exports", () => {
  it("exports all expected functions", () => {
    expect(Package).toHaveProperty("functionA");
    expect(Package).toHaveProperty("functionB");
    expect(Package).toHaveProperty("ClassC");
  });
});
```

### Testing Async Operations

```typescript
it(
  "handles async operations",
  async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
  },
  { timeout: 1000 },
); // Set timeout for async tests
```

### Mocking Dependencies

```typescript
import { vi } from "vitest";

vi.mock("../external-dep", () => ({
  externalFunction: vi.fn().mockReturnValue("mocked"),
}));
```

## 8. CI/CD Integration

Your package will automatically:

1. **On Commit**: Run smoke tests (<5s limit)
2. **On Push**: Show benchmark comparisons
3. **On PR**: Full test suite + benchmark regression check
4. **On Merge**: Update performance baselines

## 9. Troubleshooting

### "Smoke tests too slow"

```bash
# Find slow tests
pnpm test:speed-check

# View which tests are slow
pnpm test:dashboard

# Solutions:
# - Move to integration tests
# - Add mocks
# - Use test.concurrent()
```

### "Benchmark regression detected"

```bash
# Compare in detail
pnpm benchmark:compare

# If intentional (e.g., new feature):
# Document reason and update baseline
pnpm benchmark:update
git commit -m "perf: update baseline after adding X feature"
```

### "Tests not found"

Ensure tests follow naming convention:

- Unit: `*.test.ts`
- Smoke: `*.smoke.test.ts`
- Benchmark: `*.bench.ts`

## 10. Package README Template

Add this section to your package README:

```markdown
## Testing

This package follows Atomiton testing standards.

### Quick Start

\`\`\`bash

# Run all tests

pnpm test

# Run specific test types

pnpm test:unit # Unit tests
pnpm test:smoke # Smoke tests (<5s)
pnpm test:benchmark # Performance benchmarks
pnpm test:e2e # End-to-end tests

# Development

pnpm test:watch # Watch mode
pnpm test:coverage # Coverage report
\`\`\`

### Performance

- Smoke tests: ~2.3s (limit: 5s)
- Benchmarks: [View baseline](./benchmarks/baseline.json)
- Coverage: 85%
```

---

_Last Updated: 2025-01-16_
_Required for all packages_
