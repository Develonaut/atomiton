# Package.json Configuration Examples

## Apps/Client Configuration (Recommended)

```json
// apps/client/package.json
{
  "name": "@atomiton/web",
  "version": "0.1.0",
  "type": "module",
  "private": true,

  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "format:fix": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },

  "dependencies": {
    // Workspace packages
    "@atomiton/ui": "workspace:*",
    "@atomiton/theme": "workspace:*",
    "@atomiton/core": "workspace:*",

    // React ecosystem
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.8.2",

    // State management
    "zustand": "^5.0.5",

    // App-specific UI libraries (not in @atomiton/ui)
    "emoji-picker-react": "^4.12.2",
    "react-hot-toast": "^2.5.2",
    "react-plock": "^3.5.1",
    "react-rnd": "^10.5.2",
    "swiper": "^11.2.8",

    // Utilities (evaluate if needed after UI package integration)
    "react-use": "^17.6.0"
  },

  "devDependencies": {
    // Workspace configs
    "@atomiton/eslint-config": "workspace:*",
    "@atomiton/typescript-config": "workspace:*",

    // Build tools
    "@vitejs/plugin-react": "^5.0.2",
    "@tailwindcss/vite": "^4.1.12",
    "vite": "^7.1.4",
    "vite-tsconfig-paths": "^5.1.4",

    // TypeScript
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",

    // Linting & Formatting
    "eslint": "^9",
    "prettier": "^3.0.0",

    // Testing
    "@playwright/test": "^1.55.0"
  },

  "peerDependencies": {
    "tailwindcss": "^4"
  }
}
```

## Packages/UI Configuration

```json
// packages/ui/package.json
{
  "name": "@atomiton/ui",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./styles": {
      "import": "./dist/styles.css"
    },
    "./primitives": {
      "types": "./dist/primitives/index.d.ts",
      "import": "./dist/primitives/index.mjs"
    },
    "./components/*": {
      "types": "./dist/components/*.d.ts",
      "import": "./dist/components/*.mjs"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.mjs"
    },
    "./system": {
      "types": "./dist/system/index.d.ts",
      "import": "./dist/system/index.mjs"
    }
  },

  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",

  "files": ["dist", "README.md"],

  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:watch": "vite build --watch",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },

  "dependencies": {
    // Workspace dependencies
    "@atomiton/theme": "workspace:*",

    // UI framework dependencies
    "@headlessui/react": "^2.2.4",
    "@radix-ui/react-slot": "^1.2.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",

    // Component-specific dependencies
    "rc-slider": "^11.1.8",
    "react-animate-height": "^3.2.3",
    "react-textarea-autosize": "^8.5.9"
  },

  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "tailwindcss": "^4"
  },

  "devDependencies": {
    // Workspace configs
    "@atomiton/eslint-config": "workspace:*",
    "@atomiton/typescript-config": "workspace:*",

    // Build tools
    "@vitejs/plugin-react": "^5.0.2",
    "@tailwindcss/vite": "^4.1.12",
    "vite": "^7.1.4",
    "vite-tsconfig-paths": "^5.1.4",

    // TypeScript
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19",

    // Testing
    "@testing-library/react": "^15.0.2",
    "@testing-library/jest-dom": "^6.4.2",
    "vitest": "^1.6.0",
    "jsdom": "^24.0.0",

    // Development
    "concurrently": "^8.2.0"
  }
}
```

## Workspace Root Configuration

```json
// package.json (root)
{
  "name": "atomiton",
  "version": "0.1.0",
  "private": true,
  "type": "module",

  "workspaces": ["apps/*", "packages/*"],

  "scripts": {
    // Development
    "dev": "turbo dev",
    "dev:ui": "turbo dev --filter=@atomiton/ui",
    "dev:client": "turbo dev --filter=@atomiton/web",
    "dev:all": "turbo dev --parallel",

    // Building
    "build": "turbo build",
    "build:ui": "turbo build --filter=@atomiton/ui",
    "build:client": "turbo build --filter=@atomiton/web",

    // Testing
    "test": "turbo test",
    "test:watch": "turbo test:watch",
    "test:coverage": "turbo test:coverage",

    // Code quality
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "format": "turbo format:fix",
    "format:check": "turbo format:check",

    // Utilities
    "clean": "turbo clean && rm -rf node_modules",
    "fresh": "pnpm clean && pnpm install",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "turbo build && changeset publish"
  },

  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "turbo": "^2.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0"
  },

  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  },

  "packageManager": "pnpm@9.0.0"
}
```

## Migration-Specific Package.json Updates

### Step 1: Add UI Package Dependency

```json
// apps/client/package.json
{
  "dependencies": {
    // Add these lines
    "@atomiton/ui": "workspace:*",
    "@atomiton/theme": "workspace:*"
  }
}
```

### Step 2: Remove Duplicate Dependencies

After migrating components, remove dependencies that are now provided by @atomiton/ui:

```json
// apps/client/package.json
{
  "dependencies": {
    // Remove these if fully migrated to @atomiton/ui
    // "@headlessui/react": "^2.2.4", // Now from @atomiton/ui
    // "rc-slider": "^11.1.8", // Now from @atomiton/ui
    // "react-animate-height": "^3.2.3", // Now from @atomiton/ui
    // "react-textarea-autosize": "^8.5.9", // Now from @atomiton/ui

    // Keep app-specific dependencies
    "emoji-picker-react": "^4.12.2",
    "react-hot-toast": "^2.5.2",
    "react-plock": "^3.5.1"
  }
}
```

### Step 3: Update Build Scripts

```json
// apps/client/package.json
{
  "scripts": {
    // Add pre-build step to ensure UI is built
    "prebuild": "pnpm --filter @atomiton/ui build",
    "build": "vite build",

    // Add UI development in parallel
    "dev:with-ui": "concurrently \"pnpm --filter @atomiton/ui dev\" \"vite\"",

    // Add validation scripts
    "validate": "pnpm lint && pnpm typecheck && pnpm test",
    "validate:ui": "pnpm --filter @atomiton/ui validate"
  }
}
```

## TypeScript Configuration

```json
// apps/client/tsconfig.json
{
  "extends": "@atomiton/typescript-config/react.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@atomiton/ui": ["../../packages/ui/src"],
      "@atomiton/ui/*": ["../../packages/ui/src/*"],
      "@atomiton/theme": ["../../packages/theme/src"],
      "@atomiton/theme/*": ["../../packages/theme/src/*"]
    }
  },
  "include": [
    "src",
    "../../packages/ui/src/**/*.ts",
    "../../packages/ui/src/**/*.tsx"
  ],
  "references": [
    { "path": "../../packages/ui" },
    { "path": "../../packages/theme" }
  ]
}
```

## Turbo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "@atomiton/web#dev": {
      "dependsOn": ["@atomiton/ui#build", "@atomiton/theme#build"],
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["build"],
      "cache": false
    }
  }
}
```

## NPM Scripts for Migration

```json
// package.json (root) - Migration helper scripts
{
  "scripts": {
    // Component migration helpers
    "migrate:component": "node scripts/migrate-component.js",
    "migrate:check": "node scripts/check-migration-status.js",
    "migrate:validate": "pnpm build && pnpm test",

    // Dependency analysis
    "analyze:deps": "pnpm list --depth=0",
    "analyze:bundle": "pnpm --filter @atomiton/web build -- --analyze",
    "analyze:duplicates": "pnpm dedupe --check",

    // Clean migration artifacts
    "migrate:clean": "find . -name '*.deprecated.tsx' -delete",
    "migrate:backup": "git stash push -m 'migration-backup'",

    // Validation
    "validate:imports": "eslint . --rule 'no-restricted-imports: [error, { patterns: [\"@/components/*\"] }]'",
    "validate:types": "tsc --noEmit --skipLibCheck false"
  }
}
```

## Environment-Specific Configurations

### Development Overrides

```json
// apps/client/package.dev.json
{
  "overrides": {
    "@atomiton/ui": "file:../../packages/ui",
    "@atomiton/theme": "file:../../packages/theme"
  }
}
```

### Production Optimizations

```json
// apps/client/package.prod.json
{
  "overrides": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "resolutions": {
    "**/react": "^19.0.0",
    "**/react-dom": "^19.0.0"
  }
}
```

## Version Management with Changesets

```json
// .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [["@atomiton/ui", "@atomiton/theme"]],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@atomiton/web"]
}
```
