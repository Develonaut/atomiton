# Package Creation Guide

A comprehensive guide for creating new packages in the `@atomiton` namespace,
following established conventions and patterns across the monorepo.

## Overview

This guide documents the common patterns identified across all packages in
`/packages/@atomiton/` and provides step-by-step instructions for creating new
packages that follow these conventions.

## Package Analysis Summary

Based on analysis of 15 existing packages, the following patterns have been
identified:

### Common Package Types

1. **Library Packages** (`@atomiton/core`, `@atomiton/ui`, `@atomiton/nodes`)
   - Built libraries with TypeScript declarations
   - Comprehensive build and test configurations
   - Full export/import patterns

2. **Configuration Packages** (`@atomiton/eslint-config`,
   `@atomiton/typescript-config`)
   - Shared configuration files with multiple presets
   - Minimal build requirements
   - Focus on reusable settings
   - TypeScript config includes path alias support across all presets

3. **Development Packages** (`@atomiton/hooks`, `@atomiton/form`)
   - Source-only packages (no build step)
   - Direct TypeScript imports
   - Lighter configuration

## Required Files

Every package MUST include these files:

### 1. `package.json`

```json
{
  "name": "@atomiton/[package-name]",
  "version": "0.1.0",
  "description": "Brief description of package purpose",
  "type": "module",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "vite build",
    "clean": "rm -rf dist",
    "dev": "vite build --watch",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:smoke": "vitest run src/**/*.smoke.test.{ts,tsx} --passWithNoTests || echo \"No smoke tests yet\"",
    "test:benchmark": "vitest bench --run",
    "test:e2e": "echo \"No E2E tests for this package\"",
    "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark && pnpm test:e2e"
  },
  "keywords": ["keyword1", "keyword2"],
  "author": "Atomiton",
  "license": "MIT",
  "dependencies": {
    // Package-specific dependencies
  },
  "devDependencies": {
    "@atomiton/eslint-config": "workspace:*",
    "@atomiton/typescript-config": "workspace:*",
    "@types/node": "^20.0.0",
    "eslint": "^9",
    "typescript": "^5",
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

### 2. `tsconfig.json`

**For React packages using @/ path aliases:**

```json
{
  "extends": "@atomiton/typescript-config/react-library.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "types": ["node", "vitest/globals"],
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**For Node packages using @/ path aliases:**

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "vitest/globals"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**For configuration packages (no @/ imports needed):**

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. `eslint.config.js`

**For React packages:**

```js
import config from "@atomiton/eslint-config/react-internal";

export default config;
```

**For Node packages:**

```js
import config from "@atomiton/eslint-config/base";

export default config;
```

### 4. `vite.config.ts` (for library packages)

**For packages using @/ path aliases:**

```ts
import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonPackageName",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // List external dependencies that shouldn't be bundled
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
      plugins: [
        visualizer({
          filename: "dist/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"],
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
```

**For simple packages without @/ aliases:**

```ts
import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonPackageName",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // List external dependencies that shouldn't be bundled
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
      plugins: [
        visualizer({
          filename: "dist/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"],
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
  test: {
    environment: "node",
    globals: true,
  },
});
```

### 5. `vitest.config.ts` (if separate from vite.config.ts)

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // or "jsdom" for React packages
    globals: true,
  },
});
```

## Directory Structure

### Standard Structure

```
packages/@atomiton/[package-name]/
├── src/
│   ├── index.ts              # Main entry point
│   ├── api.ts                # Public API (for complex packages)
│   ├── types.ts              # Type definitions
│   ├── utils/                # Utility functions
│   ├── components/           # React components (UI packages)
│   └── __tests__/           # Test files
├── dist/                     # Build output (generated)
├── docs/                     # Package-specific documentation
├── package.json
├── tsconfig.json
├── eslint.config.js
├── vite.config.ts
├── vitest.config.ts          # If separate from vite config
├── README.md
├── CHANGELOG.md
├── CURRENT.md                # Current sprint tasks
├── COMPLETED.md              # Completed features
├── NEXT.md                   # Next sprint planning
└── ROADMAP.md                # Long-term roadmap
```

### Package-Specific Directories

- **UI packages**: Add `components/`, `theme/`, `primitives/`
- **Node packages**: Add `atomic/`, `composite/`, `base/`
- **Testing packages**: Add `test-utils/`, `mocks/`

## Export Patterns

### Main Entry Point (`src/index.ts`)

**Simple packages:**

```ts
// Direct exports for simple packages
export { MyComponent } from "./components/MyComponent";
export type { MyComponentProps } from "./components/MyComponent";
export { myUtility } from "./utils/myUtility";
```

**Complex packages (with API layer):**

```ts
/**
 * @atomiton/package-name - Main Package Exports
 */

// Main API export (singleton pattern)
export { packageName } from "./api";

// Types consumers need
export type { PackageAPI } from "./api";
export type * from "./types";
```

### API Layer (`src/api.ts`)

For complex packages that need a singleton or centralized API:

```ts
/**
 * @atomiton/package-name - Public API
 */

class PackageAPI {
  // Implementation
}

export const packageName = new PackageAPI();
export type { PackageAPI };
```

## Dependency Patterns

### Common DevDependencies

All packages should include:

```json
{
  "@atomiton/eslint-config": "workspace:*",
  "@atomiton/typescript-config": "workspace:*",
  "@types/node": "^20.0.0",
  "eslint": "^9",
  "typescript": "^5",
  "vite": "^6.0.0",
  "vitest": "^2.0.0"
}
```

### Build Tools (for library packages)

```json
{
  "rollup-plugin-visualizer": "^6.0.3",
  "terser": "^5.44.0",
  "vite-plugin-dts": "^4.5.4"
}
```

### React-Specific Dependencies

```json
{
  "@vitejs/plugin-react": "^5.0.2",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### Workspace Dependencies

Use `workspace:*` for internal packages:

```json
{
  "@atomiton/core": "workspace:*",
  "@atomiton/ui": "workspace:*"
}
```

## Package Creation Checklist

### 1. Create Directory Structure

```bash
mkdir -p packages/@atomiton/[package-name]/{src,docs}
cd packages/@atomiton/[package-name]
```

### 2. Create Configuration Files

- [ ] Create `package.json` with correct name and dependencies
- [ ] Create `tsconfig.json` extending appropriate base config
- [ ] Create `eslint.config.js` importing appropriate config
- [ ] Create `vite.config.ts` if building a library
- [ ] Create `vitest.config.ts` if needed separately

### 3. Create Source Files

- [ ] Create `src/index.ts` as main entry point
- [ ] Create `src/api.ts` if using API pattern
- [ ] Create `src/types.ts` for type definitions
- [ ] Create `src/__tests__/` directory with initial unit test
- [ ] Create `src/__tests__/api.smoke.test.ts` for smoke tests (REQUIRED)
- [ ] Create `src/__benchmarks__/api.bench.ts` for benchmarks (REQUIRED for API
      packages)

### 4. Create Documentation

- [ ] Create `README.md` with package description and usage
- [ ] Create `CHANGELOG.md` for version history
- [ ] Create project status files (CURRENT.md, COMPLETED.md, etc.)

### 5. Test Configuration

- [ ] Run `pnpm install` in package directory
- [ ] Run `pnpm typecheck` to verify TypeScript setup
- [ ] Run `pnpm lint` to verify ESLint setup
- [ ] Run `pnpm build` to verify build setup (if applicable)
- [ ] Run `pnpm test:unit` to verify unit tests
- [ ] Run `pnpm test:smoke` to verify smoke tests (MUST have actual tests, not
      just echo)
- [ ] Run `pnpm test:benchmark` to verify benchmarks (MUST have actual
      benchmarks for API packages)
- [ ] Run `pnpm test:all` to verify complete test suite

### 6. Integration

- [ ] Update root workspace if needed
- [ ] Add package to any relevant import maps
- [ ] Update documentation that references package structure

## Special Package Types

### Source-Only Packages

For packages like `@atomiton/hooks` that don't need building:

- Set `main` and `types` to `"./src/index.ts"`
- Remove build scripts and vite config
- Keep typecheck, lint, and test scripts

```json
{
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest"
  }
}
```

### Configuration Packages

For configuration packages:

- Minimal package.json
- Export configuration objects/functions
- No build step needed
- Focus on reusable settings

## Testing Conventions

### 🚨 MANDATORY Testing Requirements

**ALL packages MUST include the complete test script suite.** This is
non-negotiable.

#### Required Test Types

1. **Smoke Tests** (`*.smoke.test.ts`)
   - Small, fast suite of critical functionality tests
   - Act as "canary in the coal mine" for package health
   - Should run in < 5 seconds
   - **REQUIRED for API packages**: Must test core API methods

2. **Benchmark Tests** (`*.bench.ts`)
   - Track performance of critical operations
   - Early warning system for performance degradation
   - **REQUIRED for API packages**: Must benchmark main operations
   - **REQUIRED for data processing packages**: Must benchmark transformations

3. **Unit Tests** (`*.test.ts`)
   - Comprehensive testing of individual functions/components
   - Should aim for >80% code coverage
   - All public APIs must have tests

### Test File Organization

- Unit tests: `src/**/*.test.ts`
- Smoke tests: `src/**/*.smoke.test.ts`
- Benchmark tests: `src/**/*.bench.ts`
- Integration tests: `src/**/*.integration.test.ts`

### Standard Test Scripts

**ALL packages MUST include these test scripts**:

```json
{
  "test": "pnpm test:unit",
  "test:unit": "vitest run",
  "test:watch": "vitest watch",
  "test:coverage": "vitest run --coverage",
  "test:smoke": "vitest run src/**/*.smoke.test.{ts,tsx} --passWithNoTests || echo \"No smoke tests yet\"",
  "test:benchmark": "vitest bench --run",
  "test:e2e": "echo \"No E2E tests for this package\"",
  "test:all": "pnpm test:unit && pnpm test:smoke && pnpm test:benchmark && pnpm test:e2e"
}
```

### Example Test Implementations

#### Smoke Test Example (`src/__tests__/api.smoke.test.ts`)

```typescript
import { describe, it, expect } from "vitest";
import api from "../api";

describe("API Smoke Tests", () => {
  it("should initialize without errors", async () => {
    await expect(api.initialize()).resolves.not.toThrow();
  });

  it("should expose core methods", () => {
    expect(api.getVersion).toBeDefined();
    expect(api.process).toBeDefined();
  });

  it("should handle basic operation", async () => {
    const result = await api.process({ data: "test" });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

#### Benchmark Example (`src/__benchmarks__/api.bench.ts`)

```typescript
import { bench, describe } from "vitest";
import api from "../api";

describe("API Performance", () => {
  bench("initialization", async () => {
    await api.initialize();
  });

  bench("data processing (small)", () => {
    api.process({ size: "small", data: testData.small });
  });

  bench("data processing (large)", () => {
    api.process({ size: "large", data: testData.large });
  });
});
```

### Testing Enforcement

**Karen will REJECT packages that:**

- Don't have all test scripts defined in package.json
- Have placeholder test scripts without actual test files
- API packages without smoke tests and benchmarks
- Data processing packages without performance benchmarks
- Any package with failing smoke tests

## Common Patterns Summary

### File Naming

- Use kebab-case for directory names
- Use PascalCase for component files
- Use camelCase for utility files
- Use `.types.ts` suffix for type-only files

### Import/Export Conventions

- Always use named exports for better tree shaking
- Export types with `export type` syntax
- Use barrel exports (`index.ts`) for clean imports
- Follow API layer pattern for complex packages

### Build Configuration

- Target ES2020 for modern support
- Generate both ES modules and CommonJS
- Include source maps and type declarations
- Use Terser for minification with class name preservation
- Bundle analysis with rollup-plugin-visualizer

This guide ensures consistency across all packages while providing flexibility
for different package types and requirements.
