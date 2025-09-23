# Testing Documentation Migration Guide

## What Changed

We've consolidated our testing documentation from 6 files down to 2 files to establish a single source of truth that aligns with our philosophy of prioritizing integration/E2E tests over unit tests (similar to Bluesky's approach).

## New Structure

```
docs/testing/
├── README.md              # Complete testing strategy (single source of truth)
├── QUICK_REFERENCE.md     # Quick lookup for common tasks
└── archive/               # Old docs for reference (will delete after migration)
    ├── COMPOSITE_NODES.md
    ├── PACKAGE_TEST_SCRIPTS.md  
    ├── TEST_NAMING_STANDARDS.md
    └── USER_FLOWS.md
```

## Key Philosophy Changes

### Old Approach (Conflicting)
- Some docs emphasized unit tests
- Complex test naming conventions  
- Separate strategies for different features
- Multiple overlapping guides

### New Approach (Unified)
- **E2E First**: 60% E2E, 30% Integration, 10% Unit
- **Test user journeys, not implementation**
- **Simple naming**: Use standard `describe`/`it` pattern
- **Single source of truth**: One strategy document

## Migration Checklist

### For Existing Tests

1. **Keep existing tests** - No need to rewrite working tests
2. **New tests follow new strategy** - Write E2E/integration tests first
3. **Gradually refactor** - As you touch test files, align with new patterns

### For New Features

1. **Start with E2E test** - Define the user journey first
2. **Add integration tests** - For package APIs and data pipelines
3. **Minimal unit tests** - Only for complex pure functions

### Package.json Scripts

Simplified from 8 required scripts to 4:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:integration": "vitest run src/__tests__/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## What to Reference

- **Day-to-day testing**: Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Understanding strategy**: Read [README.md](./README.md) 
- **Historical context**: Check archive/ folder (temporary)

## Action Items

### Immediate (This Week)
- [ ] Update CI/CD pipelines to match new test categories
- [ ] Update package.json scripts in all packages
- [ ] Share this migration guide with the team

### Short Term (This Month)
- [ ] Migrate critical unit tests to integration tests where appropriate
- [ ] Add data-testid attributes to all interactive elements
- [ ] Write E2E tests for critical user journeys

### Long Term (Next Quarter)
- [ ] Achieve 100% coverage of critical user paths with E2E tests
- [ ] Reduce unit test count by 50%
- [ ] Delete archive folder once migration is complete

## Benefits of This Approach

1. **Faster Development** - Less time writing tests that don't matter
2. **Better Coverage** - Focus on what users actually do
3. **Less Maintenance** - Integration tests break less often than unit tests
4. **Clear Direction** - One strategy, no confusion
5. **Proven Approach** - Following successful patterns from Bluesky/Vercel

## Questions?

The new README is comprehensive, but if something is unclear:

1. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) first
2. Read the relevant section in [README.md](./README.md)
3. Look at existing E2E tests in `apps/e2e/src/tests/` for examples

Remember: **If it doesn't affect users, don't test it!**

---

*Migration started: 2025-01-17*  
*Archive deletion target: 2025-02-17*