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
  "imports": {
    "#*": "./src/*"
  },
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
    "test": "vitest run",
    "test:integration": "vitest run src/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
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

**For React packages using #\* path alias:**

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
      "#*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**For Node packages using #\* path alias:**

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
      "#*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Note:** The `#*` import alias is Node.js native subpath imports (requires
Node.js 12.19.0+) and provides better compatibility with Node.js tooling and
doesn't require additional build tool configuration.

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
      "#": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
```

**Note:** This second example shows a configuration without any import aliases
(if you don't need them):

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
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node", // or "jsdom" for React packages
    globals: true,
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
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

## Import Alias Usage

### Node.js Subpath Imports (#\*)

The `#*` syntax is Node.js native subpath imports (requires Node.js 12.19.0+):

```ts
// Instead of relative imports:
import { someUtil } from "../../../utils/someUtil";

// Use subpath imports:
import { someUtil } from "#utils/someUtil";
```

### Benefits of Using #\* Imports

1. **Native Node.js support** - No additional build tool configuration needed
2. **Better compatibility** - Works with Node.js tooling out of the box
3. **Cleaner imports** - Avoids deep relative path navigation
4. **Consistent paths** - Same import path regardless of file location

### Best Practices

1. **Always use `#*` for internal package imports** - It's the standard across
   all Atomiton packages
2. **Configure in three places**: package.json "imports", tsconfig.json "paths",
   and vite/vitest config "alias"
3. **Be consistent** - All imports within a package should use the `#*` pattern

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
- [ ] Create `src/integration/` directory for integration tests
- [ ] Create `src/integration/api.test.ts` for API integration tests
- [ ] Create co-located unit tests (e.g., `src/utils.test.ts`) ONLY for complex
      algorithms

### 4. Create Documentation

- [ ] Create `README.md` with package description and usage
- [ ] Create `CHANGELOG.md` for version history
- [ ] Create project status files (CURRENT.md, COMPLETED.md, etc.)

### 5. Test Configuration

- [ ] Run `pnpm install` in package directory
- [ ] Run `pnpm typecheck` to verify TypeScript setup
- [ ] Run `pnpm lint` to verify ESLint setup
- [ ] Run `pnpm build` to verify build setup (if applicable)
- [ ] Run `pnpm test` to verify all tests
- [ ] Run `pnpm test:integration` to verify integration tests
- [ ] Run `pnpm test:coverage` to check test coverage

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

### 🚨 IMPORTANT: Simplified Testing Strategy

**Following our testing documentation standards, we use ONLY 2 test file
types:**

#### File Naming Convention - Only 2 Types

```
*.test.ts   - Unit/Integration tests (folder determines type)
*.e2e.ts    - E2E Playwright tests (always in apps/e2e/tests/)
```

**No more**: `.smoke.test.ts`, `.bench.test.ts`, `.spec.ts`,
`.integration.test.ts` The folder structure tells us what type of test it is.

### Test File Organization

````
packages/@atomiton/[package]/src/
├── integration/          # Integration tests (*.test.ts)
│   └── api.test.ts      # Test package public API
└── [file].test.ts       # Co-located unit tests (minimal)

### Standard Test Scripts

**ALL packages MUST include these test scripts**:

```json
{
  "test": "vitest run",
  "test:integration": "vitest run src/integration",
  "test:watch": "vitest watch",
  "test:coverage": "vitest run --coverage"
}
````

Apps additionally have:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug"
}
```

### Example Test Implementations

#### Integration Test Example (`src/integration/api.test.ts`)

```typescript
import { describe, it, expect } from "vitest";
import { createFlow, createNode, isValidFlow } from "../index";

describe("Package API Integration", () => {
  it("should create valid flows with nodes", () => {
    const flow = createFlow({ label: "Test Flow" });
    const node = createNode({
      type: "processor",
      label: "Process",
      position: { x: 0, y: 0 },
    });

    flow.nodes.push(node);
    expect(isValidFlow(flow)).toBe(true);
  });

  it("should handle complete workflow", async () => {
    const result = await executeWorkflow(testWorkflow);
    expect(result.status).toBe("success");
    expect(result.completedNodes).toHaveLength(3);
  });
});
```

#### Unit Test Example (`src/utils.test.ts`) - Co-located

```typescript
import { describe, it, expect } from "vitest";
import { calculateNodePosition } from "./utils";

// Only test complex algorithms as unit tests
describe("calculateNodePosition", () => {
  it("should handle overlapping nodes", () => {
    const result = calculateNodePosition(overlappingNodes, 20);
    expect(result.x % 20).toBe(0);
    expect(result.y % 20).toBe(0);
  });
});
```

### Testing Best Practices

1. **Test at the highest level practical** - Prefer integration over unit tests
2. **Use real data and environments** - Avoid mocking when possible
3. **Test behavior, not implementation** - Focus on what users can do
4. **Keep tests fast** - Integration tests should run in <10s per package
5. **Use folder structure** - `src/integration/` for integration, co-locate unit
   tests

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
