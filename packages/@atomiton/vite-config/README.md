---
title: "@atomiton/vite-config"
description: "Shared Vite configuration presets for the Atomiton monorepo. This package provides standardized build configurations that reduce duplication and ensure consistency across all packages."
stage: "alpha"
version: "0.1.0"
last_updated: "2025-09-28"
dependencies: []
tags: []
ai_context:
  category: "tool"
  complexity: "simple"
  primary_language: "typescript"
---

# @atomiton/vite-config

Shared Vite configuration presets for the Atomiton monorepo. This package provides standardized build configurations that reduce duplication and ensure consistency across all packages.

## Installation

```bash
pnpm add -D @atomiton/vite-config
```

## Usage

### Library Package

For standard TypeScript libraries:

```typescript
// vite.config.ts
import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "MyLibrary",
  external: ["dependency-to-exclude"],
  chunks: {
    utils: "src/utils/",
    components: "src/components/",
  },
});
```

### React Library Package

For React component libraries:

```typescript
// vite.config.ts
import { defineReactLibraryConfig } from "@atomiton/vite-config";

export default defineReactLibraryConfig({
  name: "MyReactLibrary",
  enableTailwind: true,
  enableTsconfigPaths: true,
});
```

### Application Package

For Vite applications:

```typescript
// vite.config.ts
import { defineAppConfig } from "@atomiton/vite-config";

export default defineAppConfig({
  port: 5173,
  workspacePackages: ["@atomiton/ui", "@atomiton/core"],
  aliases: {
    "@components": "./src/components",
    "@utils": "./src/utils",
  },
});
```

## API

### `defineLibraryConfig(options)`

Creates a Vite configuration for TypeScript libraries.

**Options:**

- `name` (required): Library name for UMD builds
- `entry`: Entry point (default: `"./src/index.ts"`)
- `external`: Dependencies to exclude from bundle
- `chunks`: Manual chunk configuration
- `enableVisualizer`: Generate bundle stats (default: `true`)
- `enableMinification`: Enable terser minification (default: `true`)
- `testEnvironment`: Test environment (default: `"node"`)
- `additionalConfig`: Additional Vite config to merge

### `defineReactLibraryConfig(options)`

Creates a Vite configuration for React libraries. Extends `defineLibraryConfig` with React-specific defaults.

**Additional Options:**

- `enableTailwind`: Enable Tailwind CSS plugin (default: `false`)
- `enableTsconfigPaths`: Enable TypeScript path mapping (default: `true`)

### `defineAppConfig(options)`

Creates a Vite configuration for applications.

**Options:**

- `port`: Dev server port (default: `5173`)
- `strictPort`: Fail if port is in use (default: `true`)
- `workspacePackages`: Packages to exclude from optimization
- `aliases`: Path aliases for imports
- `enableTailwind`: Enable Tailwind CSS (default: `true`)
- `additionalConfig`: Additional Vite config to merge

## Features

- **TypeScript declarations** generation via `vite-plugin-dts`
- **Bundle visualization** with `rollup-plugin-visualizer`
- **Optimized chunking** for better tree-shaking
- **Terser minification** with sensible defaults
- **Test configuration** for Vitest
- **React support** with Fast Refresh
- **Tailwind CSS** integration
- **Path mapping** support

## License

MIT
