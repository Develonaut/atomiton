# Package Integration Guide

This guide outlines how to integrate and structure packages in the Atomiton monorepo.

## Package Organization

### Scoped vs Top-Level Packages

```
packages/
├── @atomiton/          # Internal shared modules (scoped)
│   ├── di/             # Dependency injection
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── ui/                 # Application packages (top-level)
├── core/
├── nodes/
├── theme/
└── electron/
```

- **Scoped packages** (`@atomiton/*`) - Internal shared modules and configurations
- **Top-level packages** - Application-specific packages and features

## Creating a New Package

### 1. Package Structure

```
packages/[package-name]/
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
    "@atomiton/theme": "workspace:*"
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
packages/[package-name]/
├── src/
│   ├── __tests__/       # Unit tests
│   └── __e2e__/         # E2E tests (if applicable)
└── vitest.config.ts     # Test configuration
```

## Publishing

### Scoped Packages

Internal packages are not published to npm and use `"private": true`.

### Public Packages

If a package needs to be published:

1. Remove `"private": true`
2. Configure proper exports in package.json
3. Add publish script to pipeline
4. Document public API thoroughly

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
import { Theme } from "@atomiton/theme";
import { Core } from "@atomiton/core";
```
