# Playwright E2E Tests

This directory contains root-level end-to-end tests for the Atomiton monorepo.

## Overview

These tests ensure that all applications in the monorepo can:

- Start up successfully
- Render their main content
- Navigate between routes
- Handle basic interactions
- Serve static assets properly
- **Maintain visual consistency (snapshot testing)**

## Structure

```
playwright/
├── tests/
│   ├── smoke.spec.ts           # Basic smoke tests for client and UI
│   ├── visual-snapshots.spec.ts # Visual regression tests
│   └── desktop.spec.ts         # Electron app tests (currently skipped)
├── tests/screenshots/          # Baseline snapshot images
│   └── visual-snapshots.spec.ts/
│       ├── client-*.png        # Client app snapshots
│       └── ui-*.png            # UI package snapshots
├── utils/
│   └── test-helpers.ts         # Shared test utilities
├── fixtures/                   # Test fixtures (future)
└── playwright.config.ts        # Main configuration
```

## Running Tests

### Install Playwright

```bash
pnpm test:install
```

### Run All Tests

```bash
pnpm test:e2e
```

### Run Specific Test Suites

```bash
# Quick smoke tests only
pnpm test:e2e:smoke

# Visual regression tests only
pnpm test:e2e:visual

# Specific project
pnpm test:e2e --project=client
pnpm test:e2e --project=ui
```

### Visual Snapshot Testing

```bash
# Run visual tests and compare against baseline
pnpm test:e2e:visual

# Update baseline snapshots when UI intentionally changes
pnpm test:e2e:update

# Update snapshots for specific test
pnpm test:e2e:update --grep "homepage visual"
```

### Run in UI Mode

```bash
pnpm test:e2e:ui
```

### Run in Headed Mode

```bash
pnpm test:e2e --headed
```

## Test Coverage

### ✅ Client App (`http://localhost:5173`)

- App loads and renders
- Navigation works
- No console errors
- Static assets served
- **Visual snapshots**: Homepage, header, sidebar, dark mode
- **Responsive snapshots**: Mobile, tablet, desktop

### ✅ UI Package (`http://localhost:5174`)

- Component showcase loads
- Components render
- Interactive elements work
- No console errors
- **Visual snapshots**: Component showcase, buttons, forms
- **Interactive states**: Hover, focus, active states

### 🚧 Desktop App

- Currently skipped (requires special Electron setup)
- Will be implemented in future iteration

## CI Integration

Tests are configured to run in CI with:

- Retries on failure (2 attempts)
- Single worker to avoid port conflicts
- Screenshots on failure
- Video on failure
- Trace on retry

## Development Tips

1. **Dev Servers**: Tests automatically start dev servers if not already running
2. **Reuse Servers**: Set `reuseExistingServer: true` to use already running servers
3. **Debugging**: Use `--debug` flag or `test.only` to focus on specific tests
4. **Screenshots**: Failed tests save screenshots to `playwright/screenshots/`

## Common Issues

### Port Conflicts

If you see port conflicts, kill existing processes:

```bash
pnpm kill-ports
```

### Timeout Issues

Increase timeout in config if dev servers take longer to start:

```typescript
webServer: {
  timeout: 180 * 1000, // 3 minutes
}
```

### Electron Tests

Desktop app tests require built app:

```bash
pnpm --filter @atomiton/desktop build
```

## Visual Regression Testing

### How It Works

1. **Baseline Creation**: First run creates baseline snapshots
2. **Comparison**: Subsequent runs compare against baseline
3. **Failure Detection**: Tests fail if visual differences exceed threshold
4. **Update Process**: Use `pnpm test:e2e:update` when changes are intentional

### Best Practices

- Run `pnpm test:e2e:update` after intentional UI changes
- Review snapshot diffs in the HTML report
- Commit baseline snapshots to git
- Use masks for dynamic content (timestamps, etc.)
- Keep animations disabled for consistency

### Snapshot Storage

- Baseline snapshots: `playwright/tests/screenshots/`
- Failed comparisons: `playwright/test-results/`
- Diff images shown in HTML report

## Future Enhancements

- [x] Add visual regression tests
- [ ] Add accessibility tests
- [ ] Add performance metrics
- [ ] Add API mocking fixtures
- [ ] Enable Electron tests in CI
- [ ] Add cross-browser testing
- [x] Add mobile viewport tests
