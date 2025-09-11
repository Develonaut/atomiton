# Package Integration Guide

This guide outlines how to integrate and structure packages in the Atomiton monorepo.

## Table of Contents

- [Package Organization](#package-organization)
  - [Scoped vs Top-Level Packages](#scoped-vs-top-level-packages)
- [Creating a New Package](#creating-a-new-package)
  - [Package Structure](#1-package-structure)
  - [Package.json Configuration](#2-packagejson-configuration)
  - [TypeScript Configuration](#3-typescript-configuration)
  - [Vite Configuration](#4-vite-configuration)
- [Package Dependencies](#package-dependencies)
  - [Internal Dependencies](#internal-dependencies)
  - [Shared Configurations](#shared-configurations)
- [Build Pipeline](#build-pipeline)
- [Co-located Documentation](#co-located-documentation)
- [Testing Strategy](#testing-strategy)
- [Publishing](#publishing)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Package Organization

### Package Structure

```
packages/
└── @atomiton/          # All packages are scoped under @atomiton/
    ├── core/           # Core Blueprint engine
    ├── nodes/          # Node implementations
    ├── ui/             # UI components and design system
    ├── editor/         # Editor implementation
    ├── store/          # State management
    ├── events/         # Event system
    ├── di/             # Dependency injection
    ├── eslint-config/  # Shared ESLint configuration
    └── typescript-config/ # Shared TypeScript configuration
```

- **All packages** are scoped under `@atomiton/` for consistency and namespace management
- **Configuration packages** like eslint-config and typescript-config provide shared standards
- **Feature packages** implement specific functionality for the platform

## Creating a New Package

### 1. Package Structure

```
packages/@atomiton/[package-name]/
├── src/                 # Source code
├── docs/                # Package-specific documentation
├── package.json         # Package configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── README.md            # Package overview and usage
├── ROADMAP.md           # Long-term vision
├── CURRENT.md           # Active work
├── NEXT.md              # Upcoming tasks
└── COMPLETED.md         # Finished work
```

### 2. Package.json Configuration

```json
{
  "name": "@atomiton/package-name",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {},
  "devDependencies": {
    "@atomiton/eslint-config": "workspace:*",
    "@atomiton/typescript-config": "workspace:*",
    "vite": "^5.0.0"
  }
}
```

### 3. TypeScript Configuration

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Vite Configuration

```typescript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", /^node:/],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

## Package Dependencies

### Internal Dependencies

Use workspace protocol for internal dependencies:

```json
{
  "dependencies": {
    "@atomiton/core": "workspace:*",
    "@atomiton/ui": "workspace:*"
  }
}
```

### Shared Configurations

All packages should extend shared configurations:

- `@atomiton/eslint-config` - ESLint rules
- `@atomiton/typescript-config` - TypeScript settings

## Build Pipeline

### Turborepo Configuration

Packages are integrated into the Turborepo pipeline:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "format": {}
  }
}
```

## Co-located Documentation

Each package maintains its own documentation:

- **README.md** - Package overview and API
- **ROADMAP.md** - Long-term vision and architecture
- **CURRENT.md** - Active work and priorities
- **NEXT.md** - Upcoming features and tasks
- **COMPLETED.md** - Finished work and changelog

## Testing Strategy

Packages should include appropriate testing:

```
packages/@atomiton/[package-name]/
├── src/
│   ├── __tests__/       # Unit tests
│   └── __e2e__/         # E2E tests (if applicable)
└── vitest.config.ts     # Test configuration
```

## Publishing

### Package Publishing Policy

Currently, all `@atomiton/*` packages are internal to the monorepo and use `"private": true`.

### Future Publishing Considerations

If any package becomes suitable for external use:

1. Remove `"private": true` from package.json
2. Configure proper exports and entry points
3. Add publish script to Turborepo pipeline
4. Document public API thoroughly
5. Add appropriate licensing and usage documentation

## Migration Guide

### Converting Existing Code to a Package

1. Create package structure
2. Move source code to `src/`
3. Set up build configuration
4. Update import paths in dependent packages
5. Test build and integration
6. Document API and usage

## Best Practices

1. **Single Responsibility** - Each package should have one clear purpose
2. **Minimal Dependencies** - Avoid unnecessary dependencies
3. **Clear APIs** - Export only what's needed
4. **Type Safety** - Full TypeScript coverage
5. **Documentation** - Keep docs co-located and up-to-date
6. **Testing** - Appropriate test coverage for package functionality

## Common Patterns

### Barrel Exports

```typescript
// src/index.ts
export * from "./components";
export * from "./utils";
export * from "./types";
```

### Path Aliases

```typescript
// Use @ for internal package imports
import { Component } from "@/components";
import { util } from "@/utils";
```

### Workspace References

```typescript
// Import from other workspace packages
import { Button } from "@atomiton/ui";
import { Blueprint } from "@atomiton/core";
```
