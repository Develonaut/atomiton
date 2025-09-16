# Testing Documentation

## Core Documents

### Essential Guides

- **[TESTING.md](./TESTING.md)** - Main testing strategy and standards
- **[PACKAGE_TESTING_GUIDE.md](./PACKAGE_TESTING_GUIDE.md)** - Complete guide for package test implementation
- **[TESTING_IMPROVEMENTS_SUMMARY.md](./TESTING_IMPROVEMENTS_SUMMARY.md)** - Recent improvements and quick reference

### Performance & Workflow

- **[TEST_PERFORMANCE_TRACKING.md](./TEST_PERFORMANCE_TRACKING.md)** - Performance monitoring and benchmarking
- **[PERFORMANCE_WORKFLOW_INTEGRATION.md](./PERFORMANCE_WORKFLOW_INTEGRATION.md)** - Git hooks and CI/CD integration

### Test Types

- **[TESTING_PHILOSOPHY.md](./TESTING_PHILOSOPHY.md)** - Testing philosophy and principles
- **[CRITICAL_USER_FLOWS.md](./CRITICAL_USER_FLOWS.md)** - E2E test specifications

## Quick Reference

### Standard Test Scripts (8 per package)

```json
{
  "test": "pnpm test:unit",
  "test:unit": "vitest run",
  "test:smoke": "vitest run src/__tests__/smoke",
  "test:benchmark": "vitest bench --run",
  "test:e2e": "playwright test || echo 'No E2E'",
  "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark",
  "test:watch": "vitest watch",
  "test:coverage": "vitest run --coverage"
}
```

### Folder Structure

```
src/
├── components/
│   └── __tests__/        # Co-located unit tests
├── utils/
│   └── __tests__/        # Co-located unit tests
└── __tests__/
    ├── unit/             # Unit tests
    ├── integration/      # Integration tests
    ├── smoke/            # Package smoke tests (<5s)
    └── benchmark/        # Performance tests
```

**Folder Organization Guidelines:**

- `__tests__/unit/` - Pure unit tests with heavy mocking (use `.unit.test.ts` naming)
- `__tests__/integration/` - Cross-component integration tests (use `.integration.test.ts` naming)
- `__tests__/smoke/` - Fast critical functionality tests (use `.smoke.test.ts` naming)
- `__tests__/benchmark/` - Performance and speed tests (use `.bench.ts` naming)

### Performance Limits

- **Smoke tests**: <5 seconds (blocking)
- **Unit tests**: <100ms each (warning)
- **Benchmarks**: <10% regression (blocking)
- **E2E tests**: <2 minutes (warning)

### Commands

```bash
# Dashboard
pnpm test:dashboard

# Run smoke tests
pnpm test:smoke

# Check speed
pnpm test:speed-check

# Compare benchmarks
pnpm benchmark:compare
```

## Recent Updates (2025-01-16)

✅ Reduced root scripts from 11 to 5
✅ Standardized to 8 scripts per package
✅ Converted all scripts to TypeScript
✅ Added performance tracking with dashboards
✅ Implemented git hook integration
✅ Created comprehensive documentation

---

_For detailed implementation instructions, start with [PACKAGE_TESTING_GUIDE.md](./PACKAGE_TESTING_GUIDE.md)_
