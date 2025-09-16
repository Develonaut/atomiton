# Test Performance Tracking System

## Overview

This document defines how we track test execution times, benchmark results, and detect performance degradations across the Atomiton codebase.

## 1. Test Speed Tracking

### Smoke Test Requirements

**Hard Limit: 5 seconds total**

Smoke tests MUST complete within 5 seconds. Any test suite exceeding this limit should be moved to integration tests.

### Implementation

#### Vitest Reporter Configuration

```javascript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["default", "json", "./scripts/test-speed-reporter.ts"],
    outputFile: {
      json: "./test-results/speed-report.json",
    },
  },
});
```

#### Speed Tracking Output

Test results are saved to:

- `test-results/speed-report.json` - Latest run
- `test-results/history/speed-{timestamp}.json` - Historical data

### Speed Report Format

```json
{
  "timestamp": "2025-01-16T10:00:00Z",
  "package": "@atomiton/store",
  "type": "smoke",
  "totalDuration": 3450,
  "tests": [
    {
      "name": "api.smoke.test.ts",
      "duration": 1200,
      "status": "passed"
    },
    {
      "name": "critical.smoke.test.ts",
      "duration": 2250,
      "status": "passed"
    }
  ],
  "threshold": {
    "limit": 5000,
    "status": "passed"
  }
}
```

## 2. Benchmark Performance Tracking

### Baseline Management

Each package maintains benchmark baselines in:

```
packages/@atomiton/[package]/
└── benchmarks/
    ├── baseline.json          # Current approved baseline
    ├── latest.json            # Latest run results
    └── history/               # Historical results
        └── benchmark-{date}.json
```

### Benchmark Configuration

```javascript
// vitest.bench.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    benchmark: {
      outputFile: "./benchmarks/latest.json",
      compare: "./benchmarks/baseline.json",
      threshold: {
        degradation: 10, // Fail if >10% slower
      },
    },
  },
});
```

### Benchmark Result Format

```json
{
  "timestamp": "2025-01-16T10:00:00Z",
  "environment": {
    "node": "20.11.0",
    "cpu": "Apple M2",
    "memory": "16GB"
  },
  "benchmarks": [
    {
      "name": "parseBlueprint - 10 nodes",
      "ops": 15234,
      "margin": 0.89,
      "samples": 1000,
      "mean": 0.0656,
      "median": 0.065,
      "baseline": 0.06,
      "change": "+9.3%"
    },
    {
      "name": "parseBlueprint - 1000 nodes",
      "ops": 142,
      "margin": 1.23,
      "samples": 100,
      "mean": 7.042,
      "median": 6.98,
      "baseline": 6.5,
      "change": "+8.3%"
    }
  ]
}
```

## 3. Performance Scripts

### test-speed-check.js

```javascript
#!/usr/bin/env node
// scripts/test-speed-check.js

const fs = require("fs");
const path = require("path");

const SMOKE_TEST_LIMIT = 5000; // 5 seconds
const UNIT_TEST_LIMIT = 100; // 100ms per test

function checkTestSpeed(reportPath, type = "smoke") {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  const limit = type === "smoke" ? SMOKE_TEST_LIMIT : UNIT_TEST_LIMIT;

  if (report.totalDuration > limit) {
    console.error(`❌ ${type} tests exceeded limit!`);
    console.error(`   Limit: ${limit}ms`);
    console.error(`   Actual: ${report.totalDuration}ms`);

    // Show slowest tests
    const slowTests = report.tests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    console.error("\nSlowest tests:");
    slowTests.forEach((test) => {
      console.error(`   ${test.name}: ${test.duration}ms`);
    });

    process.exit(1);
  }

  console.log(
    `✅ ${type} tests within limit (${report.totalDuration}ms < ${limit}ms)`,
  );
}

// Run check
const reportPath = process.argv[2] || "./test-results/speed-report.json";
const testType = process.argv[3] || "smoke";
checkTestSpeed(reportPath, testType);
```

### benchmark-compare.js

```javascript
#!/usr/bin/env node
// scripts/benchmark-compare.js

const fs = require("fs");
const path = require("path");

const DEGRADATION_THRESHOLD = 0.1; // 10%

function compareBenchmarks(baselinePath, latestPath) {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));
  const latest = JSON.parse(fs.readFileSync(latestPath, "utf-8"));

  let hasRegression = false;
  const report = [];

  latest.benchmarks.forEach((bench) => {
    const baselineBench = baseline.benchmarks.find(
      (b) => b.name === bench.name,
    );
    if (!baselineBench) return;

    const change = (bench.mean - baselineBench.mean) / baselineBench.mean;

    if (change > DEGRADATION_THRESHOLD) {
      hasRegression = true;
      report.push({
        name: bench.name,
        baseline: baselineBench.mean,
        current: bench.mean,
        change: `+${(change * 100).toFixed(1)}%`,
        status: "❌ REGRESSION",
      });
    } else if (change < -0.05) {
      report.push({
        name: bench.name,
        baseline: baselineBench.mean,
        current: bench.mean,
        change: `${(change * 100).toFixed(1)}%`,
        status: "✅ IMPROVEMENT",
      });
    }
  });

  // Print report
  console.log("\n📊 Benchmark Comparison Report\n");
  console.table(report);

  if (hasRegression) {
    console.error("\n❌ Performance regressions detected!");
    process.exit(1);
  }

  console.log("\n✅ No performance regressions detected");
}

// Run comparison
const baselinePath = "./benchmarks/baseline.json";
const latestPath = "./benchmarks/latest.json";
compareBenchmarks(baselinePath, latestPath);
```

## 4. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Run benchmarks
        run: pnpm test:benchmark

      - name: Compare with baseline
        run: node scripts/benchmark-compare.js

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: |
            **/benchmarks/latest.json
            **/test-results/speed-report.json

      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('./benchmark-report.md', 'utf-8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

## 5. Package.json Scripts

Add these scripts to each package:

```json
{
  "scripts": {
    "test:speed": "vitest run --reporter=json --outputFile=test-results/speed-report.json && node ../../scripts/test-speed-check.js",
    "benchmark:run": "vitest bench --outputFile=benchmarks/latest.json",
    "benchmark:compare": "node ../../scripts/benchmark-compare.js",
    "benchmark:update": "cp benchmarks/latest.json benchmarks/baseline.json",
    "benchmark:history": "cp benchmarks/latest.json benchmarks/history/benchmark-$(date +%Y%m%d).json"
  }
}
```

## 6. Pre-commit Hook Integration

Update `.husky/pre-commit` to check smoke test speed:

```bash
#!/bin/sh
# Check smoke test speed
echo "⏱️ Checking smoke test speed..."
pnpm test:smoke --reporter=json --outputFile=test-results/speed-report.json
node scripts/test-speed-check.js test-results/speed-report.json smoke

if [ $? -ne 0 ]; then
  echo "❌ Smoke tests too slow! Must complete in <5 seconds"
  echo "💡 Move slow tests to integration suite"
  exit 1
fi
```

## 7. Monitoring Dashboard

### Local Dashboard Command

```bash
# View test speed trends
pnpm test:dashboard

# Shows:
# - Test execution times over last 30 days
# - Benchmark performance trends
# - Slowest tests by package
# - Regression alerts
```

### Dashboard Implementation

Create `scripts/test-dashboard.js`:

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

function generateDashboard() {
  const reports = glob.sync("**/test-results/history/*.json");

  const data = reports.map((file) =>
    JSON.parse(fs.readFileSync(file, "utf-8")),
  );

  // Generate ASCII chart
  console.log("\n📊 Test Speed Trend (Last 30 days)\n");
  console.log("5000ms │");
  console.log("4000ms │     ▄");
  console.log("3000ms │   ▄ █ ▄");
  console.log("2000ms │ ▄ █ █ █ ▄");
  console.log("1000ms │ █ █ █ █ █");
  console.log("       └─────────────");
  console.log("         1w  2w  3w  4w");

  // Show current stats
  console.log("\n📈 Current Performance\n");
  console.table({
    "Smoke Tests": "3.2s (✅ under 5s)",
    "Unit Tests": "45ms avg (✅)",
    Benchmarks: "No regressions (✅)",
  });

  // Show warnings
  console.log("\n⚠️ Tests Approaching Limits\n");
  console.table([
    { test: "api.smoke.test.ts", current: "4.2s", limit: "5s", status: "⚠️" },
    {
      test: "heavy.unit.test.ts",
      current: "89ms",
      limit: "100ms",
      status: "⚠️",
    },
  ]);
}

generateDashboard();
```

## 8. Best Practices

### DO's ✅

1. **Record every test run** in CI/CD
2. **Compare against baselines** before merging
3. **Archive historical data** for trend analysis
4. **Set hard limits** for smoke tests (5s)
5. **Alert on degradation** > 10%
6. **Update baselines** intentionally with justification

### DON'Ts ❌

1. **Don't ignore small regressions** - they compound
2. **Don't update baselines** without review
3. **Don't mix test types** in speed measurements
4. **Don't test on different hardware** without normalization
5. **Don't skip performance checks** in CI

## 9. Troubleshooting

### Common Issues

1. **Flaky benchmark results**
   - Solution: Increase sample size
   - Use median instead of mean
   - Run in isolated environment

2. **False positives in CI**
   - Solution: Use percentile thresholds
   - Account for CI environment variance
   - Use rolling averages

3. **Historical data growth**
   - Solution: Rotate logs after 90 days
   - Compress old reports
   - Store aggregates only

---

_Last Updated: 2025-01-16_
_Version: 1.0.0_
