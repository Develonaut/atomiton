# Package Reorganization Plan - Following n8n Pattern

## Overview

Reorganizing Atomiton packages to follow n8n's scoped package pattern for better organization, clear separation of concerns, and maintainable architecture.

## Current Structure

```
packages/
├── ui/          # UI component library
├── core/        # Store + event emitter
├── nodes/       # Node implementations
├── theme/       # Shared theming
└── @atomiton/
    ├── di/
    ├── eslint-config/
    └── typescript-config/
```

## New Structure

```
packages/
├── core/                    # Main API entry point (public)
├── ui/                      # UI components (public)
└── @atomiton/              # Internal/support packages
    ├── store/              # State management (internal)
    ├── events/             # Event emitter (internal)
    ├── nodes/              # Node implementations (internal)
    ├── theme/              # Shared theming (internal)
    ├── di/                 # Existing
    ├── eslint-config/      # Existing
    └── typescript-config/  # Existing
```

## Package Naming Convention

### Public-Facing Packages

- `@atomiton/core` - Main API that apps import
- `@atomiton/ui` - UI component library for apps

### Internal Packages (under @atomiton/ folder)

- `@atomiton/store` - State management
- `@atomiton/events` - Event emitter service
- `@atomiton/nodes` - Node system and registry
- `@atomiton/theme` - Shared theming and design tokens

## Import Patterns

### For Applications (apps/client, apps/electron)

```typescript
// Apps only import from core and ui
import { createBlueprint, useStore } from "@atomiton/core";
import { Button, NodeEditor } from "@atomiton/ui";
```

### For Internal Packages

```typescript
// packages/core/src/index.ts
import { createStore } from "@atomiton/store";
import { EventEmitter } from "@atomiton/events";

// Re-export for apps
export { createStore, EventEmitter };
```

## Dependency Flow

```
Apps (client/electron)
├── depend on → @atomiton/core
└── depend on → @atomiton/ui

@atomiton/core
├── depends on → @atomiton/store
├── depends on → @atomiton/events
└── depends on → @atomiton/nodes

@atomiton/ui
└── depends on → @atomiton/theme

@atomiton/nodes
└── depends on → @atomiton/theme
```

## Benefits

1. **Clear Public API**: Apps only need to know about `core` and `ui`
2. **Namespace Protection**: @atomiton scope prevents naming conflicts
3. **Internal vs External**: Clear distinction between public and internal packages
4. **Maintainability**: Can refactor internals without breaking apps
5. **Following Industry Standard**: Same pattern as n8n, Angular, Vue, etc.

## Migration Steps

1. **Extract from current core/**
   - Move store logic → `@atomiton/store`
   - Move event emitter → `@atomiton/events`
   - Keep Blueprint orchestration in core

2. **Move existing packages**
   - `nodes/` → `@atomiton/nodes/`
   - `theme/` → `@atomiton/theme/`

3. **Update core to re-export**
   - Core becomes the "barrel export" for internal packages
   - Provides stable public API for apps

4. **Update all imports**
   - Apps: Change to import from `@atomiton/core` and `@atomiton/ui`
   - Internal: Update cross-package imports

5. **Update workspace configuration**
   - Update pnpm-workspace.yaml
   - Update turbo.json build pipeline

## Key Decisions

- **Core and UI remain at package root level** (not under @atomiton/)
- **All internal packages go under @atomiton/ folder**
- **Apps only depend on core and ui** (never internal packages directly)
- **Core aggregates and re-exports** functionality from internal packages

## Example Package.json

```json
// apps/client/package.json
{
  "dependencies": {
    "@atomiton/core": "workspace:*",
    "@atomiton/ui": "workspace:*"
  }
}

// packages/core/package.json
{
  "name": "@atomiton/core",
  "dependencies": {
    "@atomiton/store": "workspace:*",
    "@atomiton/events": "workspace:*",
    "@atomiton/nodes": "workspace:*"
  }
}
```

## Notes

- This follows n8n's exact pattern where `n8n`, `n8n-core`, `n8n-editor-ui` are siblings to `@n8n/` folder
- Provides clean separation between public API and internal implementation
- Makes it immediately clear which packages are meant for external consumption
