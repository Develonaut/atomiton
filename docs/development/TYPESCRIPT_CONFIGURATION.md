# TypeScript Configuration Guide

This guide documents the standardized TypeScript configuration system for the
Atomiton monorepo, including the new preset system and path alias
standardization.

## Overview

The `@atomiton/typescript-config` package provides a centralized TypeScript
configuration system with multiple presets optimized for different use cases.
All configurations include standardized path alias support for the `@/` pattern.

## Available Configurations

### Base Configurations

#### `@atomiton/typescript-config/base.json`

**Primary base configuration with path alias support**

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

**Use for:** Node.js packages, utilities, and general TypeScript libraries.

**Features:**

- Standard @/ path alias configuration
- Modern ES2022 target
- Strict type checking
- Node.js compatibility

#### `@atomiton/typescript-config/library.json`

**Library-specific configuration**

```json
{
  "extends": "@atomiton/typescript-config/library.json"
}
```

**Use for:** Standalone libraries that will be published or distributed.

**Features:**

- Declaration file generation
- Source map support
- Optimized for library distribution

### React Configurations

#### `@atomiton/typescript-config/react-library.json`

**React library configuration with path aliases**

```json
{
  "extends": "@atomiton/typescript-config/react-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

**Use for:** React component libraries and UI packages.

**Features:**

- React JSX support
- DOM types included
- Component-optimized settings
- Path alias support

### Bundler Configurations

#### `@atomiton/typescript-config/bundler.json`

**Bundler-optimized configuration**

```json
{
  "extends": "@atomiton/typescript-config/bundler.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

**Use for:** Packages that will be processed by Vite, Webpack, or other
bundlers.

**Features:**

- Module resolution optimized for bundlers
- Tree-shaking friendly settings
- Build tool compatibility

#### `@atomiton/typescript-config/react-bundler.json`

**React bundler configuration**

```json
{
  "extends": "@atomiton/typescript-config/react-bundler.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

**Use for:** React applications and packages using modern bundlers.

### Development Configurations

#### `@atomiton/typescript-config/development.json`

**Development-optimized configuration**

```json
{
  "extends": "@atomiton/typescript-config/development.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

**Use for:** Development environments requiring faster compilation.

**Features:**

- Faster compilation settings
- Development-friendly error reporting
- Hot reload optimization

#### `@atomiton/typescript-config/react-development.json`

**React development configuration**

```json
{
  "extends": "@atomiton/typescript-config/react-development.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

**Use for:** React development environments.

## Path Alias System

### Standardized @/ Pattern

All TypeScript configurations support the standardized `@/` path alias pattern:

```typescript
// Internal package imports
import { Component } from "@/components";
import { utility } from "@/utils";
import { MyType } from "@/types";
import { config } from "@/config";
```

### Configuration Requirements

**For packages using @/ path aliases, the following is REQUIRED in
tsconfig.json:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

### Vite Integration

**Packages using Vite must also configure the alias in vite.config.ts:**

```typescript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

## Migration from Legacy Configurations

### Before (Legacy)

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

### After (Standardized)

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  }
}
```

## Package-Specific Examples

### React UI Package

```json
{
  "extends": "@atomiton/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Node.js Utility Package

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Configuration Package (No @/ aliases needed)

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*", "*.json"],
  "exclude": ["node_modules", "dist"]
}
```

### Application Package (Client/Desktop)

```json
{
  "extends": "@atomiton/typescript-config/react-bundler.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*", "./*"]
    },
    "types": ["vite/client", "node"]
  },
  "include": ["src/**/*", "vite-env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Cross-Package Import Patterns

### Internal Imports (within package)

```typescript
// Use @/ for internal imports
import { Button } from "@/components/Button";
import { theme } from "@/theme";
import { ApiClient } from "@/services/api";
```

### Cross-Package Imports (between packages)

```typescript
// Use @atomiton/* for cross-package imports (unchanged)
import { Core } from "@atomiton/core";
import { Theme } from "@atomiton/theme";
import { Button } from "@atomiton/ui";
```

## Configuration Selection Guide

| Package Type           | Recommended Configuration | Path Aliases |
| ---------------------- | ------------------------- | ------------ |
| React UI Components    | `react-library.json`      | Required     |
| Node.js Libraries      | `base.json`               | Required     |
| Applications (Client)  | `react-bundler.json`      | Required     |
| Applications (Desktop) | `react-bundler.json`      | Required     |
| Utility Packages       | `base.json`               | Required     |
| Configuration Packages | `base.json`               | Optional     |
| Development Tools      | `development.json`        | As needed    |

## Best Practices

### 1. Always Use Appropriate Preset

Choose the most specific configuration for your use case rather than customizing
the base configuration.

### 2. Minimize Custom Overrides

Only add custom `compilerOptions` when absolutely necessary. The presets are
designed to cover common scenarios.

### 3. Consistent Path Usage

- Use `@/` for internal package imports
- Use `@atomiton/*` for cross-package imports
- Use relative imports only for very close files (same directory)

### 4. BaseUrl Requirement

Always include `baseUrl: "."` when using `@/` path aliases to ensure proper
resolution.

### 5. Build Tool Alignment

Ensure your Vite/Webpack configuration matches your TypeScript path aliases.

## Troubleshooting

### Common Issues

#### Path Resolution Errors

```
Cannot find module '@/components' or its corresponding type declarations
```

**Solution:** Ensure `baseUrl` and `paths` are configured in tsconfig.json.

#### Vite Import Errors

```
Failed to resolve import "@/utils" from "src/components/Button.tsx"
```

**Solution:** Configure Vite alias in vite.config.ts.

#### Build Tool Conflicts

```
Module resolution issues during build
```

**Solution:** Use bundler-specific configurations (`bundler.json` or
`react-bundler.json`).

## Migration Checklist

- [ ] Update tsconfig.json to use appropriate preset
- [ ] Add `baseUrl: "."` if using @/ aliases
- [ ] Add `paths` configuration for @/ aliases
- [ ] Update Vite configuration if needed
- [ ] Convert relative imports to @/ aliases
- [ ] Verify all imports resolve correctly
- [ ] Run `pnpm typecheck` to validate configuration
- [ ] Test build process if applicable

---

This standardized approach ensures consistent TypeScript configuration across
all packages while providing flexibility for different use cases and build
requirements.
