# @atomiton/store

Simplified state management for the Atomiton Blueprint platform.

## Overview

This package provides a clean, functional API for creating Zustand stores with built-in Immer support and optional persistence. Perfect for managing application state in the Blueprint editor, node configurations, and runtime execution state.

**Simplified from 473 to 111 lines of core code** - focusing on what you actually need.

## Installation

This package is part of the Atomiton monorepo and is not published separately.

## Features

- **Simple API**: One function to create stores with all features
- **Immutable Updates**: Built-in Immer integration for clean state mutations
- **Optional Persistence**: Easy localStorage persistence with migration support
- **TypeScript-First**: Full type safety and excellent IntelliSense
- **DevTools Support**: Automatic Redux DevTools integration in development
- **React Integration**: Works seamlessly with React components
- **Automatic Naming**: Consistent "atomiton-" prefix with kebab-case formatting

## Store Naming Convention

All stores automatically follow a consistent naming pattern:

- **DevTools names**: Automatically prefixed with "atomiton-" and converted to kebab-case
- **Examples**:
  - `name: "BlueprintStore"` → DevTools shows `"atomiton-blueprint-store"`
  - `name: "Navigation"` → DevTools shows `"atomiton-navigation"`
  - `name: "Settings"` → DevTools shows `"atomiton-settings"`

This ensures all Atomiton stores are easily identifiable in development tools and follows consistent naming conventions across the platform.

## Quick Start

### Basic Store

```typescript
import { createStore } from '@atomiton/store';

// Simple counter store
const counterStore = createStore(() => ({ count: 0 }));

// Use in React
import { useStore } from '@atomiton/store';

function Counter() {
  const { count } = useStore(counterStore);

  const increment = () => {
    counterStore.setState((state) => {
      state.count += 1; // Immer makes this immutable
    });
  };

  return <button onClick={increment}>Count: {count}</button>;
}
```

### Persisted Store

```typescript
import { createStore } from "@atomiton/store";

// Store with localStorage persistence
const settingsStore = createStore(
  () => ({
    theme: "light" as "light" | "dark",
    language: "en",
  }),
  {
    name: "Settings", // DevTools name becomes "atomiton-settings"
    persist: {
      key: "app-settings", // Saves to localStorage as 'store:app-settings'
    },
  },
);
```

### Complex State Updates

```typescript
// Blueprint store example
const blueprintStore = createStore(
  () => ({
    nodes: new Map(),
    connections: [],
    selectedNodeId: null as string | null,
  }),
  {
    name: "BlueprintStore", // DevTools name becomes "atomiton-blueprint-store"
  },
);

// Add a new node
blueprintStore.setState((state) => {
  const nodeId = generateId();
  state.nodes.set(nodeId, {
    id: nodeId,
    type: "action",
    position: { x: 100, y: 100 },
    data: {},
  });
  state.selectedNodeId = nodeId;
});
```

## API Reference

### `createStore<T>(initializer, config?)`

Creates a new store with the given initial state and configuration.

#### Parameters

- **`initializer`**: `() => T` - Function that returns the initial state
- **`config`**: `StoreConfig<T>` (optional) - Store configuration

#### Configuration Options

```typescript
interface StoreConfig<T> {
  name?: string; // Store name for DevTools (default: "Store")
  // Automatically prefixed with "atomiton-" and converted to kebab-case
  persist?: PersistConfig<T>; // Persistence configuration
}

interface PersistConfig<T> {
  key: string; // Storage key (required for persistence)
  storage?: PersistStorage<T>; // Custom storage (default: localStorage)
  partialize?: (state: T) => Partial<T>; // Select what to persist
  version?: number; // Schema version for migrations
  migrate?: (persistedState: unknown, version: number) => T | Promise<T>;
  skipHydration?: boolean; // Skip automatic rehydration
}
```

#### Returns

A store object with these methods:

- `getState()`: Get current state
- `setState(updater, replace?)`: Update state (with Immer support)
- `subscribe(listener)`: Subscribe to state changes

### React Integration

```typescript
import { useStore, shallow } from "@atomiton/store";

// Basic usage
const state = useStore(myStore);

// With selector for performance
const count = useStore(myStore, (state) => state.count);

// With shallow comparison for objects
const settings = useStore(myStore, (state) => state.settings, shallow);
```

## Migration from Legacy API

If you're migrating from the old StoreAPI singleton approach:

### Before (Legacy)

```typescript
import { StoreAPI } from "@atomiton/store";

const store = StoreAPI.createStore(/* ... */);
const action = StoreAPI.createAction(/* ... */);
const selector = StoreAPI.createSelector(/* ... */);
```

### After (Simplified)

```typescript
import { createStore } from "@atomiton/store";

const store = createStore(
  () => ({
    /* initial state */
  }),
  {
    name: "CounterStore", // DevTools will show "atomiton-counter-store"
  },
);

// Actions are just functions that call setState
const increment = () =>
  store.setState((state) => {
    state.count += 1;
  });

// Selectors are just functions or inline selectors with useStore
const getCount = (state) => state.count;
```

The store package simplifies state management while maintaining full type safety and the automatic "atomiton-" prefix ensures all stores are easily identifiable in development tools.

## Development

```bash
# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Dependencies

- `zustand` - Lightweight state management
- `immer` - Immutable state updates

## License

MIT
