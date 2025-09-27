# Atomiton Packages

This directory contains all shared packages for the Atomiton Flow
automation platform.

## Package Organization Philosophy

All packages start in the `@atomiton/` namespace as internal packages. This
approach allows us to:

1. **Iterate quickly** without worrying about public API stability
2. **Refactor freely** as we discover better patterns
3. **Share code efficiently** across apps and other packages
4. **Graduate to public packages** only when truly ready

## Structure

```
packages/
└── @atomiton/          # Internal packages namespace
    ├── core/           # Core engine & service aggregator
    ├── ui/             # UI components & design system
    ├── nodes/          # Node definitions & logic
    ├── store/          # State management (Zustand)
    ├── events/         # Event system
    ├── di/             # Dependency injection
    └── [configs...]    # Various configuration packages
```

## Package Types

### Core Functionality

- **`@atomiton/core`** - Service aggregator providing unified API access
  - Flow management
  - Execution engine
  - Storage clients
  - Platform detection

### UI & Visual

- **`@atomiton/ui`** - Reusable UI components and design system

### Infrastructure

- **`@atomiton/store`** - Centralized state management
- **`@atomiton/events`** - Event bus for cross-package communication
- **`@atomiton/di`** - Dependency injection container
- **`@atomiton/nodes`** - Node system and definitions

### Configuration

- **`@atomiton/typescript-config`** - Shared TypeScript configurations
- **`@atomiton/eslint-config`** - Shared ESLint rules

## Import Patterns

### For Internal Apps (apps/\*)

```typescript
// Apps can import from any @atomiton package
import { Button, Card } from "@atomiton/ui";
import { Core } from "@atomiton/core";

// Use Core as service aggregator
const flow = await Core.Flow.create();
const result = await Core.Execution.run(flow);
```

### For Internal Packages

```typescript
// Packages can import from other internal packages
import { BaseNode } from "@atomiton/nodes";
import { useStore } from "@atomiton/store";
import { Button } from "@atomiton/ui";
```

## Development Workflow

### Starting a New Package

1. **Always start internal**: Create under `@atomiton/`
2. **No premature abstraction**: Don't design for external use initially
3. **Iterate freely**: Break things, experiment, refactor

### Package Lifecycle

```
Start Internal → Mature → Evaluate → (Maybe) Promote to Public
```

#### When to Consider Making a Package Public

- Package has been stable for several months
- Clear, documented API
- Makes sense as standalone functionality
- External users have expressed interest
- No breaking changes planned

#### How to Promote to Public

**Option A: Move (if no internal dependencies)**

```bash
# Move the package
mv packages/@atomiton/feature packages/feature

# Update package.json name
# Update all imports
```

**Option B: Create Facade (if other internals depend on it)**

```typescript
// packages/feature/src/index.ts (new public package)
export {
  // Curated public API only
  Feature,
  FeatureConfig,
} from "@atomiton/feature";

// Don't export internal utilities
// Don't export experimental features
```

## Dependency Rules

### ✅ Allowed

- Apps can import from any package
- Internal packages can import from other internal packages
- Public packages can import from internal packages

### ❌ Not Allowed

- Internal packages importing from public packages (avoid circular deps)
- Direct file imports (always use package exports)

## Best Practices

1. **Export from index.ts**: Each package should have a clear public API
2. **Avoid circular dependencies**: Use events or DI for decoupling
3. **Keep packages focused**: Single responsibility principle
4. **Document exports**: Use JSDoc comments for public APIs
5. **Version together**: All packages share the monorepo version

## Future Considerations

As the platform matures, some packages may be published to npm:

- `@atomiton/ui` → Could become a public design system
- `@atomiton/nodes` → Could allow community node contributions

But for now, keeping everything internal gives us maximum flexibility to build
the best possible platform.

## Questions?

See the [Architecture Documentation](../docs/architecture/README.md) for more
details on how these packages work together.
