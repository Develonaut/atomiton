# Test Performance Workflow Integration

## When Performance Checks Run in Development Workflow

### 1. Development Time (Local)

#### During Coding

```bash
# Developer runs while coding
pnpm test:watch           # Instant feedback, no performance tracking
pnpm test:dashboard       # Check current performance status
```

**No automatic performance checks** - Focus on functionality

#### Pre-Commit (ENFORCED)

```bash
# .husky/pre-commit
✅ Smoke tests MUST complete in <5 seconds
❌ Blocks commit if exceeded
```

**What runs:**

- Smoke test speed check only
- No benchmarks (too slow for pre-commit)

#### Pre-Push (OPTIONAL WARNING)

```bash
# .husky/pre-push
⚠️ Runs critical E2E flows
📊 Shows benchmark comparison (non-blocking)
```

**What runs:**

- Critical user flow tests (Playwright)
- Quick benchmark comparison if available
- **Does NOT block** push (just warns)

### 2. Pull Request (CI/CD)

#### On PR Open/Update (REQUIRED)

```yaml
# Runs automatically on every PR push
name: PR Performance Check
on: [pull_request]

jobs:
  performance:
    - Smoke test speed check (blocking)
    - Unit test performance (informational)
    - Benchmark comparison (blocking if >10% regression)
```

**Blocks merge if:**

- Smoke tests exceed 5 seconds
- Benchmark regression >10%

#### PR Comment Bot

```markdown
## 📊 Performance Report

### ⏱️ Test Speed

- Smoke tests: 3.2s / 5s ✅
- Unit tests: 45ms avg ✅

### 📈 Benchmark Changes

| Test            | Baseline | Current | Change   |
| --------------- | -------- | ------- | -------- |
| parseBlueprint  | 65ms     | 68ms    | +4.6% ✅ |
| executeWorkflow | 142ms    | 156ms   | +9.9% ⚠️ |

No blocking regressions detected.
```

### 3. Main Branch (Post-Merge)

#### Nightly Performance Run

```yaml
# Runs at 2 AM daily
name: Nightly Performance Baseline
on:
  schedule:
    - cron: "0 2 * * *"

jobs:
  baseline:
    - Full benchmark suite
    - Update baseline if improvements found
    - Alert on degradation trends
```

#### Weekly Performance Report

```yaml
# Runs Monday morning
name: Weekly Performance Report
on:
  schedule:
    - cron: "0 9 * * 1"

jobs:
  report:
    - Generate trend analysis
    - Identify slow tests
    - Create optimization tickets
```

## Integration Points

### 1. Package.json Scripts

Every package must have:

```json
{
  "scripts": {
    // Regular development
    "test": "vitest run",
    "test:watch": "vitest watch",

    // Performance tracking
    "test:speed": "vitest run --reporter=json --outputFile=test-results/speed.json && node ../../scripts/test-speed-check.js",
    "benchmark:run": "vitest bench --outputFile=benchmarks/latest.json",
    "benchmark:compare": "node ../../scripts/benchmark-compare.js",
    "benchmark:update": "cp benchmarks/latest.json benchmarks/baseline.json"
  }
}
```

### 2. Git Hooks

```bash
# .husky/pre-commit
#!/bin/sh
echo "🔥 Running smoke tests..."
pnpm test:smoke

# Speed check (custom implementation)
if [ -f "test-results/speed.json" ]; then
  node scripts/test-speed-check.js test-results/speed.json smoke
  if [ $? -ne 0 ]; then
    echo "❌ Smoke tests too slow!"
    exit 1
  fi
fi

# .husky/pre-push
#!/bin/sh
echo "📊 Checking performance..."
pnpm benchmark:compare || echo "⚠️ Performance changes detected (non-blocking)"
```

### 3. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    steps:
      - name: Run tests with timing
        run: |
          pnpm test --reporter=json --outputFile=test-results/speed.json

      - name: Check smoke test speed
        run: node scripts/test-speed-check.js test-results/speed.json smoke

      - name: Run benchmarks
        if: github.event_name == 'pull_request'
        run: pnpm benchmark:run

      - name: Compare benchmarks
        if: github.event_name == 'pull_request'
        run: pnpm benchmark:compare
        continue-on-error: true # Warning only

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            test-results/
            benchmarks/
```

### 4. Local Development Commands

```bash
# Quick checks during development
pnpm test:speed          # Check current test speed
pnpm test:dashboard      # View performance dashboard
pnpm benchmark:run       # Run benchmarks locally
pnpm benchmark:compare   # Compare against baseline

# Maintenance commands
pnpm benchmark:update    # Update baseline (with caution!)
pnpm test:analyze        # Deep analysis of slow tests
```

## Decision Tree: When to Run What

```
Is it a...
├── Code change?
│   └── Run nothing automatically (use test:watch)
│
├── Commit?
│   ├── Run smoke tests (<5s)
│   └── Check speed → Block if too slow
│
├── Push?
│   ├── Run E2E tests (optional)
│   └── Show benchmark comparison (informational)
│
├── PR?
│   ├── Run full test suite
│   ├── Check all speed limits
│   └── Compare benchmarks → Block if regression >10%
│
└── Merge to main?
    ├── Update performance baselines
    └── Archive results for trends
```

## Performance Budget Enforcement

### Automated Limits

| Test Type   | Hard Limit | Warning At | Action       |
| ----------- | ---------- | ---------- | ------------ |
| Smoke       | 5s         | 4s         | Block commit |
| Unit (each) | 100ms      | 75ms       | Warning only |
| Integration | 30s        | 25s        | Warning only |
| E2E         | 2min       | 90s        | Warning only |
| Benchmark   | -10%       | -5%        | Block PR     |

### Manual Review Triggers

Performance reviews required when:

- Any test exceeds warning threshold 3 times
- Total test time increases >20% in a week
- New package added without benchmarks
- Baseline update requested

## Dashboard Access Points

### Local Development

```bash
pnpm test:dashboard          # Real-time dashboard
pnpm test:dashboard --watch  # Auto-refresh mode
```

### CI/CD Artifacts

- Every PR generates performance report
- Available in GitHub Actions artifacts
- Linked in PR comment

### Monitoring URLs

```
/metrics/test-performance    # Grafana dashboard (if configured)
/reports/weekly-performance  # Weekly email report
```

## Rollout Plan

### Phase 1: Foundation (Week 1)

- [x] Install scripts in all packages
- [x] Create baseline benchmarks
- [x] Set up pre-commit hooks

### Phase 2: Enforcement (Week 2)

- [ ] Enable CI/CD checks (non-blocking)
- [ ] Start collecting metrics
- [ ] Train team on dashboard

### Phase 3: Optimization (Week 3-4)

- [ ] Fix identified slow tests
- [ ] Enable blocking on regressions
- [ ] Implement automated alerts

### Phase 4: Maintenance (Ongoing)

- [ ] Weekly performance reviews
- [ ] Quarterly baseline updates
- [ ] Continuous optimization

## Troubleshooting

### Common Issues

**"Smoke tests suddenly slow"**

1. Check for new heavy imports
2. Look for missing test mocks
3. Review recent dependency updates

**"Benchmarks flaky in CI"**

1. Increase sample size
2. Use median instead of mean
3. Add warmup runs

**"Can't update baseline"**

1. Requires team lead approval
2. Must document reason in PR
3. Old baseline archived automatically

---

_Last Updated: 2025-01-16_
_Status: Implementation Ready_
