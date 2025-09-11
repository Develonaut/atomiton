# Script Standardization Guide

## Overview

This guide defines the standard set of npm scripts that should be present in all packages within the Atomiton monorepo. Standardizing scripts improves developer experience, ensures consistency, and makes the codebase more maintainable.

## Standard Script Set

### Core Scripts (Required for All Packages)

Every package MUST have these scripts:

```json
{
  "scripts": {
    "build": "...",           // Build the package
    "clean": "...",           // Clean build artifacts
    "dev": "...",             // Development mode
    "format": "...",          // Format code with Prettier
    "format:check": "...",    // Check formatting
    "lint": "...",            // Lint code with ESLint
    "lint:fix": "...",        // Fix linting issues
    "typecheck": "..."        // TypeScript type checking
  }
}
```

### Testing Scripts (Required for Packages with Tests)

Packages with test suites MUST have:

```json
{
  "scripts": {
    "test": "...",            // Run all tests
    "test:watch": "...",      // Run tests in watch mode
    "test:coverage": "..."    // Run tests with coverage
  }
}
```

### Quality Scripts (Required for All Non-Config Packages)

Regular packages SHOULD have:

```json
{
  "scripts": {
    "knip": "...",            // Dead code detection
    "knip:fix": "..."         // Fix dead code issues
  }
}
```

### Optional Scripts (As Needed)

These scripts can be added based on package requirements:

```json
{
  "scripts": {
    "preview": "...",         // Preview built application
    "test:unit": "...",       // Unit tests only
    "test:integration": "...", // Integration tests
    "test:e2e": "...",        // End-to-end tests
    "test:smoke": "...",      // Smoke tests
    "analyze": "...",         // Bundle analysis
    "bench": "...",           // Performance benchmarks
    "docs": "..."             // Generate documentation
  }
}
```

## Implementation by Package Type

### 1. Library Packages (core, store, events, di, nodes)

```json
{
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "dev": "tsc --watch",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "knip": "knip",
    "knip:fix": "knip --fix"
  }
}
```

### 2. UI Component Libraries (ui, editor)

```json
{
  "scripts": {
    "build": "vite build",
    "clean": "rm -rf dist",
    "dev": "vite build --watch",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "preview": "vite preview",
    "knip": "knip",
    "knip:fix": "knip --fix"
  }
}
```

### 3. Application Packages (client, desktop)

```json
{
  "scripts": {
    "build": "vite build",
    "clean": "rm -rf dist",
    "dev": "vite",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "preview": "vite preview",
    "knip": "knip",
    "knip:fix": "knip --fix"
  }
}
```

### 4. Configuration Packages (eslint-config, typescript-config)

```json
{
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "format": "echo 'No formatting needed for config-only package'",
    "format:check": "echo 'No format check needed for config-only package'",
    "lint": "echo 'No linting needed for config-only package'",
    "lint:fix": "echo 'No linting fixes needed for config-only package'",
    "typecheck": "echo 'No TypeScript to check for config-only package'"
  }
}
```

### 5. Hook/Utility Packages (hooks)

```json
{
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "dev": "tsc --watch",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "knip": "knip",
    "knip:fix": "knip --fix"
  }
}
```

## Standard Command Implementations

### Build Commands

- **TypeScript packages**: `tsc` or `tsc -p tsconfig.build.json`
- **Vite packages**: `vite build`
- **Electron packages**: `electron-vite build`

### Clean Commands

- **All packages**: `rm -rf dist`
- **Additional**: `rm -rf .turbo node_modules` for deep clean

### Dev Commands

- **TypeScript watch**: `tsc --watch`
- **Vite dev server**: `vite`
- **Vite build watch**: `vite build --watch`

### Format Commands

- **Regular packages**: `prettier --write "**/*.{ts,tsx,md,json}"`
- **Config packages**: `echo 'No formatting needed for config-only package'`

### Lint Commands

- **Source packages**: `eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0`
- **All files**: `eslint .`
- **Config packages**: `echo 'No linting needed for config-only package'`

### Test Commands

- **Vitest**: `vitest run` (single run), `vitest` (watch mode)
- **Playwright**: `playwright test`
- **Coverage**: `vitest run --coverage`

### Knip Commands

- **Check**: `knip`
- **Fix**: `knip --fix`
- **Specific checks**: `knip --dependencies`, `knip --exports`, `knip --types`

## Migration Plan

### Phase 1: Core Scripts
Add missing core scripts to all packages:
- [ ] Ensure all packages have `clean` script
- [ ] Standardize `build`, `dev`, `format`, `lint`, `typecheck`

### Phase 2: Testing Scripts
Standardize testing across packages:
- [ ] Add `test:watch` to packages missing it
- [ ] Add `test:coverage` to all test-enabled packages
- [ ] Add `test:e2e` to application packages

### Phase 3: Quality Scripts
Add quality tooling:
- [ ] Add `knip` and `knip:fix` to all non-config packages
- [ ] Configure knip for each workspace in `knip.json`

### Phase 4: Optimization
- [ ] Review and optimize script implementations
- [ ] Ensure all scripts work with Turbo
- [ ] Add appropriate Turbo task configurations

## Benefits

1. **Consistency**: Same commands work across all packages
2. **Discoverability**: Developers know what scripts are available
3. **Quality**: Built-in quality checks (knip, coverage, etc.)
4. **Automation**: CI/CD can rely on standard scripts
5. **Onboarding**: New developers learn one set of commands

## Validation

After standardization, validate that:

```bash
# All packages have required scripts
for pkg in packages/@atomiton/*/package.json apps/*/package.json; do
  echo "Checking $(basename $(dirname $pkg))"
  jq '.scripts | has("build", "clean", "dev", "format", "format:check", "lint", "lint:fix", "typecheck")' "$pkg"
done

# Turbo can run all standard tasks
turbo run build lint typecheck test format:check --dry-run

# Knip works across all packages
turbo run knip
```

## Maintenance

- Review and update this guide quarterly
- Add new standard scripts as needs emerge
- Remove deprecated scripts
- Keep implementations current with tool updates

---

**Last Updated**: 2025-01-11
**Status**: Ready for Implementation