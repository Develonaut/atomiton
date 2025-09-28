---
title: "@atomiton/e2e"
description: "End-to-end tests for the Atomiton application using Playwright."
stage: "alpha"
version: "0.1.0"
last_updated: "2025-09-28"
dependencies: []
tags: []
ai_context:
  category: "tool"
  complexity: "moderate"
  primary_language: "typescript"
---
# E2E Tests

End-to-end tests for the Atomiton application using Playwright.

## Test Structure

The tests are organized into:

- `tests/` - Regular browser tests
- `tests/electron/` - Electron-specific tests

## Running Tests

### Prerequisites

1. Ensure the dev server is running:

   ```bash
   pnpm dev
   ```

2. Build the desktop app (for Electron tests):
   ```bash
   pnpm --filter @atomiton/desktop build
   ```

### Test Commands

**Run tests in headless mode (default - no visible browser):**

```bash
pnpm test:e2e
```

**Run tests in headed mode (visible browser windows):**

```bash
pnpm test:e2e:headed
```

**Run specific test files:**

```bash
cd apps/e2e
pnpm test --grep "debug page"
```

**Open Playwright UI:**

```bash
pnpm test:e2e:ui
```

**Debug tests:**

```bash
pnpm test:e2e:debug
```

## Debug Page Tests

The debug page tests (`tests/electron/debug-page.electron.e2e.ts`) test the IPC
functionality through the `/debug` route instead of a static HTML file.

### Requirements

- Dev server must be running at `http://localhost:5173`
- The `/debug` route is only available in development mode
- Electron app will connect to the dev server to access the debug page

### What's tested

- Environment detection (Electron vs Browser)
- IPC availability
- IPC method functionality (ping, executeNode, storage operations)
- API method detection

## Migration from desktop-test.html

Previously, tests used a static `desktop-test.html` file. This has been replaced
with the `/debug` route in the main application, which provides:

- Better integration with the actual app
- React-based UI for testing
- Same IPC testing capabilities
- More maintainable test infrastructure
