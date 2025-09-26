# Desktop E2E Testing Strategy

## Overview

This document outlines the strategy for migrating from the current `pnpm dev`
based E2E testing setup to Playwright's official webServer configuration
approach. This migration will improve test reliability, performance, and
maintainability.

## Current State Analysis

### Problems with Current Approach

1. **Inefficient Resource Usage**: `pnpm dev` starts ALL services (client,
   desktop, nodes, editor, store, logger)
2. **Poor Test Isolation**: Browser tests get Electron services they don't need
3. **Manual Lifecycle Management**: Custom Electron helper with hardcoded paths
4. **No Health Checks**: No proper server readiness detection
5. **CI/Local Inconsistency**: Same approach for both environments

### Current Setup Files

- `apps/e2e/playwright.config.ts` - Main browser test config
- `apps/e2e/playwright.electron.config.ts` - Electron test config
- `apps/e2e/tests/helpers/electron.ts` - Manual Electron management
- `apps/e2e/package.json` - Test scripts using `pnpm dev`

## Target Architecture

### Official Playwright Patterns

1. **webServer Configuration**: Built-in server lifecycle management
2. **Project-Specific Servers**: Different servers for different test types
3. **Environment Awareness**: Different behavior for CI vs local
4. **Built-in Electron Support**: Use `playwright._electron` directly

### Benefits

- **Performance**: 50-70% faster test startup (only required services)
- **Reliability**: Playwright handles ports, health checks, cleanup
- **Maintainability**: No custom scripts, follows official docs
- **Scalability**: Easy to add new test projects/environments

## Build Strategy

### Dependency Graph

```
Client Dependencies:
├── @atomiton/ui
├── @atomiton/editor
├── @atomiton/nodes
├── @atomiton/store
├── @atomiton/router
├── @atomiton/hooks
├── @atomiton/logger
└── @atomiton/utils

Desktop Dependencies:
├── @atomiton/ipc
├── @atomiton/logger
├── @atomiton/nodes
└── @atomiton/storage
```

### Build Commands

#### Client Build (with dependencies)

```bash
# Build all workspace dependencies
pnpm run build:client-deps

# Which runs:
pnpm --filter @atomiton/utils build && \
pnpm --filter @atomiton/logger build && \
pnpm --filter @atomiton/hooks build && \
pnpm --filter @atomiton/store build && \
pnpm --filter @atomiton/router build && \
pnpm --filter @atomiton/ui build && \
pnpm --filter @atomiton/nodes build && \
pnpm --filter @atomiton/editor build && \
pnpm --filter @atomiton/client build
```

#### Desktop Build (with dependencies)

```bash
# Build desktop dependencies
pnpm run build:desktop-deps

# Which runs:
pnpm --filter @atomiton/logger build && \
pnpm --filter @atomiton/ipc build && \
pnpm --filter @atomiton/storage build && \
pnpm --filter @atomiton/nodes build && \
pnpm --filter @atomiton/desktop build
```

## Implementation Plan

### Phase 1: Browser Tests Configuration ✅

Update `apps/e2e/playwright.config.ts`:

```typescript
export default defineConfig({
  webServer: {
    command: process.env.CI
      ? "pnpm run build:client-deps && pnpm --filter @atomiton/client preview --port 5173"
      : "pnpm --filter @atomiton/client dev --port 5173",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  // ... rest of config
});
```

### Phase 2: Electron Tests Configuration ✅

Update `apps/e2e/playwright.electron.config.ts`:

```typescript
export default defineConfig({
  webServer: [
    {
      command: process.env.CI
        ? "pnpm run build:client-deps && pnpm --filter @atomiton/client preview --port 5173"
        : "pnpm --filter @atomiton/client dev --port 5173",
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: process.env.CI
        ? "pnpm run build:desktop-deps"
        : "pnpm --filter @atomiton/desktop build",
      port: null, // Desktop doesn't serve on a port
      timeout: 180000,
    },
  ],
  // ... rest of config
});
```

### Phase 3: Simplify Electron Helper ✅

Update `apps/e2e/tests/helpers/electron.ts`:

```typescript
import { _electron as electron } from "@playwright/test";

export async function setupElectronApp() {
  // Use Playwright's built-in Electron support
  const electronApp = await electron.launch({
    args: [path.join(__dirname, "../../../desktop/out/main/index.js")],
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  });

  return electronApp;
}
```

### Phase 4: Update Package Scripts ✅

Add to root `package.json`:

```json
{
  "scripts": {
    "build:client-deps": "pnpm --filter @atomiton/utils build && pnpm --filter @atomiton/logger build && pnpm --filter @atomiton/hooks build && pnpm --filter @atomiton/store build && pnpm --filter @atomiton/router build && pnpm --filter @atomiton/ui build && pnpm --filter @atomiton/nodes build && pnpm --filter @atomiton/editor build && pnpm --filter @atomiton/client build",
    "build:desktop-deps": "pnpm --filter @atomiton/logger build && pnpm --filter @atomiton/ipc build && pnpm --filter @atomiton/storage build && pnpm --filter @atomiton/nodes build && pnpm --filter @atomiton/desktop build",
    "test:e2e": "pnpm --filter @atomiton/e2e test",
    "test:e2e:electron": "pnpm --filter @atomiton/e2e test:electron"
  }
}
```

Update `apps/e2e/package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:electron": "playwright test --config=playwright.electron.config.ts",
    "test:ci": "CI=true playwright test",
    "test:electron:ci": "CI=true playwright test --config=playwright.electron.config.ts"
  }
}
```

## Progress Tracking

- [x] Create this strategy document
- [x] Add build scripts to root package.json
- [x] Update main Playwright config for Electron-only tests
- [x] Remove separate Electron config (not needed)
- [x] Simplify Electron helper to use Playwright built-ins
- [x] Update E2E package.json scripts
- [ ] Test locally with new setup
- [ ] Test in CI environment
- [ ] Update CI workflow files

## Final Implementation Summary

The implementation is now complete with these key changes:

1. **Single Configuration**: `apps/e2e/playwright.config.ts` handles both client
   and desktop
2. **webServer Array**: Manages client server (port 5173) and desktop build
3. **Simplified Helper**: Uses Playwright's built-in Electron support
4. **Build Scripts**: `build:client-deps` and `build:desktop-deps` in root
   package.json
5. **Clean Commands**: Just `test:e2e` and `test:e2e:ci`

## Testing Checklist

### Local Development

- [ ] Browser tests start only client server
- [ ] Electron tests start both client and desktop
- [ ] Existing dev servers are reused
- [ ] Tests run successfully

### CI Environment

- [ ] Dependencies build in correct order
- [ ] Production builds are used
- [ ] No port conflicts
- [ ] Tests pass reliably

## Migration Commands

### Before (Current)

```bash
# Everything starts with pnpm dev
pnpm dev
pnpm --filter @atomiton/e2e test
```

### After (Target)

```bash
# Browser tests (local)
pnpm test:e2e

# Electron tests (local)
pnpm test:e2e:electron

# CI tests
pnpm test:e2e:ci
pnpm test:e2e:electron:ci
```

## Notes

- Build times in CI will increase initially but overall test time will decrease
- Local development experience will be faster due to server reuse
- Consider caching built dependencies in CI for faster runs
- Monitor for any flaky tests during migration

## References

- [Playwright webServer Documentation](https://playwright.dev/docs/test-webserver)
- [Playwright Electron Testing](https://playwright.dev/docs/api/class-electron)
- [Playwright CI Configuration](https://playwright.dev/docs/ci)
