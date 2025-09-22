# Naming Consistency Migration - Web vs Desktop, Browser vs Electron vs Node

## Background

Based on Guilliman's research into industry standards (Playwright, Vitest, MDN, W3C), we need to standardize our naming conventions across the Atomiton monorepo to align with industry best practices.

## Current State Analysis

### ✅ Already Correct

- `@atomiton/testing/playwright/web` - Testing web applications ✓
- `@atomiton/events/browser/createBrowserEventBus.ts` - Browser environment implementation ✓
- Package structure: `./playwright/web` vs `./playwright/electron` ✓

### ❌ Needs Migration

- `apps/desktop/tsconfig.web.json` → Should be `tsconfig.browser.json` (execution environment)
- Any other "web" references that should be "browser" for execution context
- Any inconsistent usage throughout the codebase

## Migration Rules

### Use "Web" for Application Domain/Targets:

- ✅ Web applications, web platform features, web development tools
- ✅ Testing web applications, web components, web workflows
- ✅ Standards/APIs: Web standards compliance, web technology usage
- ✅ User-facing context: Web app testing, web platform features

### Use "Browser" for Execution Environment:

- ✅ Browser-specific implementations, browser contexts, browser lifecycle
- ✅ Platform differences: Cross-browser compatibility, browser-specific code
- ✅ Technical infrastructure: Browser automation, browser execution

### Use "Desktop" for Application Domain/Targets:

- ✅ Desktop applications, desktop workflows, desktop features
- ✅ User-facing desktop context, desktop development tools

### Use "Electron" for Execution Environment:

- ✅ Electron-specific implementations, Electron contexts, Electron lifecycle
- ✅ Technical infrastructure: Electron automation, Electron execution

## Implementation Strategy

### Pattern Examples

```typescript
// ✅ Correct Usage After Migration
@atomiton/testing/playwright/web        // Testing web applications
@atomiton/testing/playwright/electron   // Testing desktop applications in Electron
@atomiton/events/browser               // Browser environment implementation
@atomiton/events/electron              // Electron environment implementation
@atomiton/vite-config/web             // Web app build configuration
@atomiton/vite-config/desktop         // Desktop app build configuration

// Execution contexts
tsconfig.browser.json    // Browser execution environment
tsconfig.electron.json   // Electron execution environment
tsconfig.node.json       // Node execution environment
```

### Specific Files to Review/Migrate

1. **Desktop App Structure**
   - `tsconfig.web.json` → `tsconfig.browser.json`
   - Any references to "web" that should be "browser" for renderer process

2. **Throughout Codebase**
   - Search for inconsistent "web"/"browser" usage
   - Apply rules: "web" = application domain, "browser" = execution environment
   - Search for inconsistent "desktop"/"electron" usage
   - Apply rules: "desktop" = application domain, "electron" = execution environment

3. **Package Configurations**
   - Review all package.json exports for consistency
   - Review all TypeScript configurations
   - Review all build configurations

### Benefits of This Migration

1. **Framework Alignment**: Matches Playwright, Vitest, and modern web development tools
2. **Industry Standards**: Consistent with MDN, W3C, and major platform documentation
3. **Clear Semantics**: Logical distinction between what you're building vs where it runs
4. **Future-Proof**: Scales well for potential mobile web, desktop web, etc.

## Action Items

- [ ] Create comprehensive find/replace plan for the codebase
- [ ] Update TypeScript configurations in apps/desktop
- [ ] Review all package.json exports for consistency
- [ ] Update any documentation that references the old naming
- [ ] Test that all configurations still work after renaming
- [ ] Update any CI/CD scripts that reference the old file names

## Research Reference

This migration is based on Guilliman's comprehensive research into:

- Playwright official patterns and documentation
- Vitest standard usage and conventions
- Industry consensus from MDN, W3C, major browsers
- Framework tool recommendations and best practices

The goal is to follow existing industry conventions rather than creating custom patterns, adhering to the principle that "the framework already solved this."
