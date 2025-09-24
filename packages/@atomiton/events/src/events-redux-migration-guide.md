# Events Redux Package Migration Guide

## Overview

This guide outlines the refactoring of the events package to improve
organization, flexibility, and maintainability while preserving all existing
functionality. The refactor focuses on creating a cleaner separation between
browser and desktop implementations while adding new capabilities.

## Current Analysis

### Strengths of Current Implementation

- Clean `EventContext` pattern for abstraction
- Domain-based event isolation
- Type-safe event definitions
- Good error handling with safe listeners
- IPC bridge abstraction
- Comprehensive test coverage

### Areas for Improvement

1. Browser implementation locked to "global" domain
2. Auto-forwarding defined but not integrated into main API
3. No base class to reduce duplication
4. IPC bridge could be better integrated with EventBus API
5. Tests and benchmarks mixed with source files

## New Package Structure

```
packages/events-redux/
├── src/
│   ├── core/                      # Shared core functionality
│   │   ├── types/
│   │   │   ├── bus.ts             # EventBus interface with bridge API
│   │   │   ├── events.ts          # Event type definitions
│   │   │   ├── ipc.ts             # IPC types
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── channels.ts        # IPC channel constants
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── event-naming.ts    # createEventName utility
│   │       ├── safe-listener.ts   # createSafeListener utility
│   │       └── index.ts
│   │
│   ├── browser/                   # Browser implementation
│   │   ├── bus/
│   │   │   ├── BrowserEventBus.ts
│   │   │   ├── BrowserEventBus.test.ts
│   │   │   ├── BrowserEventBus.bench.ts
│   │   │   └── index.ts
│   │   ├── bridge/
│   │   │   ├── BrowserIPCBridge.ts
│   │   │   ├── BrowserIPCBridge.test.ts
│   │   │   └── index.ts
│   │   └── index.ts               # Browser factory & exports
│   │
│   ├── desktop/                   # Desktop/Node.js implementation
│   │   ├── bus/
│   │   │   ├── DesktopEventBus.ts
│   │   │   ├── DesktopEventBus.test.ts
│   │   │   ├── DesktopEventBus.bench.ts
│   │   │   ├── LocalEventBus.ts
│   │   │   ├── LocalEventBus.test.ts
│   │   │   └── index.ts
│   │   ├── bridge/
│   │   │   ├── DesktopIPCHandler.ts
│   │   │   ├── DesktopIPCHandler.test.ts
│   │   │   ├── AutoForwarder.ts
│   │   │   ├── AutoForwarder.test.ts
│   │   │   └── index.ts
│   │   └── index.ts               # Desktop factory & exports
│   │
│   ├── shared/                    # Shared abstractions
│   │   ├── BaseEventBus.ts       # Abstract base class
│   │   ├── BaseEventBus.test.ts
│   │   ├── EventContext.ts       # EventContext type & factory
│   │   ├── EventRegistry.ts      # Event type registry
│   │   └── index.ts
│   │
│   └── index.ts                   # Package root (re-exports)
│
├── tests/                         # Integration tests only
│   ├── integration/
│   │   ├── browser-desktop-bridge.test.ts
│   │   ├── ipc-flow.test.ts
│   │   └── multi-domain.test.ts
│   └── fixtures/
│       └── test-events.ts
│
├── ORGANIZE_ME/                   # Old code for reference
│   └── [existing files]
│
├── package.json
├── tsconfig.json
├── tsconfig.browser.json
├── tsconfig.node.json
└── vitest.config.ts
```

## Key Refactoring Changes (Functional Approach)

### 1. Enhanced EventBus Interface

**New Type Definition** (`src/core/types/bus.ts`):

```typescript
export interface EventBus<T extends EventMap = EventMap> {
  // Existing methods
  emit<K extends keyof T>(event: K, data: T[K]): void;
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
  once<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  removeAllListeners(): void;
  listenerCount<K extends keyof T>(event: K): number;
  getDomain(): string;

  // New bridge API for cross-environment communication
  bridge?: EventBridge<T>;

  // New middleware support
  middleware?: EventMiddleware;
}

export interface EventBridge<T extends EventMap = EventMap> {
  forward<K extends keyof T>(event: K, target: "browser" | "desktop"): void;
  isForwarded<K extends keyof T>(event: K): boolean;
  stopForwarding<K extends keyof T>(
    event: K,
    target?: "browser" | "desktop",
  ): void;
  getForwardingRules(): Map<keyof T, Set<"browser" | "desktop">>;
}

export interface EventMiddleware {
  use(fn: (event: string, data: any) => any): void;
  remove(fn: (event: string, data: any) => any): void;
  clear(): void;
}
```

### 2. Shared Factory Helpers (No Classes!)

**Create** `src/shared/createBaseEventBus.ts`:

```typescript
import type {
  EventBus,
  EventMap,
  EventBridge,
  EventMiddleware,
} from "#core/types";
import type { EventContext } from "./EventContext";

export interface BaseEventBusOptions {
  domain: string;
  context: EventContext;
  enableBridge?: boolean;
  enableMiddleware?: boolean;
}

// Factory that creates the shared event bus functionality
export function createBaseEventBus<T extends EventMap = EventMap>(
  options: BaseEventBusOptions,
): EventBus<T> {
  const { domain, context, enableBridge, enableMiddleware } = options;
  const forwarding = new Map<keyof T, Set<"browser" | "desktop">>();
  const middlewares: Array<(event: string, data: any) => any> = [];

  // Create bridge implementation if enabled
  const bridge: EventBridge<T> | undefined = enableBridge
    ? {
        forward: (event, target) => {
          if (!forwarding.has(event)) {
            forwarding.set(event, new Set());
          }
          forwarding.get(event)!.add(target);
          // Hook into context to setup forwarding
        },
        isForwarded: (event) => forwarding.has(event),
        stopForwarding: (event, target) => {
          if (target) {
            forwarding.get(event)?.delete(target);
          } else {
            forwarding.delete(event);
          }
        },
        getForwardingRules: () => new Map(forwarding),
      }
    : undefined;

  // Create middleware implementation if enabled
  const middleware: EventMiddleware | undefined = enableMiddleware
    ? {
        use: (fn) => middlewares.push(fn),
        remove: (fn) => {
          const index = middlewares.indexOf(fn);
          if (index !== -1) middlewares.splice(index, 1);
        },
        clear: () => (middlewares.length = 0),
      }
    : undefined;

  // Apply middleware to emit
  const originalEmit = context.emit;
  if (enableMiddleware) {
    context.emit = (eventName, data) => {
      const processedData = middlewares.reduce(
        (d, fn) => fn(eventName, d),
        data,
      );
      originalEmit(eventName, processedData);
    };
  }

  // Return the complete EventBus implementation
  return {
    emit: createEmit<T>(context),
    on: createOn<T>(context),
    once: createOnce<T>(context),
    off: createOff<T>(context),
    removeAllListeners: () => context.removeAllListeners(),
    listenerCount: createListenerCount<T>(context),
    getDomain: () => domain,
    bridge,
    middleware,
  };
}
```

### 3. Browser Implementation with Factory

**Create** `src/browser/bus/createBrowserEventBus.ts`:

```typescript
import { EventEmitter as EventEmitter3 } from "eventemitter3";
import { createBaseEventBus } from "#shared/createBaseEventBus";
import { createBrowserIPCBridge } from "#browser/bridge";
import type { EventBus, EventMap } from "#core/types";

export interface BrowserEventBusOptions {
  domain?: string;
  enableBridge?: boolean;
  enableMiddleware?: boolean;
  ipcConfig?: IPCConfig;
}

export function createBrowserEventBus<T extends EventMap = EventMap>(
  options?: BrowserEventBusOptions,
): EventBus<T> {
  const {
    domain = "global",
    enableBridge = false,
    enableMiddleware = false,
    ipcConfig,
  } = options ?? {};

  const emitter = new EventEmitter3();

  // Create the event context using EventEmitter3
  const context: EventContext = {
    emit: (eventName, data) => emitter.emit(eventName, data),
    on: (eventName, listener) => emitter.on(eventName, listener),
    once: (eventName, listener) => emitter.once(eventName, listener),
    off: (eventName, listener) => emitter.off(eventName, listener),
    removeAllListeners: () => emitter.removeAllListeners(),
    listenerCount: (eventName) => emitter.listenerCount(eventName),
    listenerMap: new WeakMap(),
    domain,
  };

  // Create the base event bus with shared functionality
  const bus = createBaseEventBus<T>({
    domain,
    context,
    enableBridge,
    enableMiddleware,
  });

  // If bridge is enabled, set up IPC
  if (enableBridge && bus.bridge) {
    const ipcBridge = createBrowserIPCBridge(ipcConfig);
    // Wire up the bridge to IPC...
  }

  return bus;
}
```

### 4. Desktop Implementation with Factory

**Create** `src/desktop/bus/createDesktopEventBus.ts`:

```typescript
import { EventEmitter } from "node:events";
import { createBaseEventBus } from "#shared/createBaseEventBus";
import { createDesktopIPCHandler } from "#desktop/bridge";
import type { EventBus, EventMap } from "#core/types";

export interface DesktopEventBusOptions {
  domain?: string;
  maxListeners?: number;
  enableBridge?: boolean;
  enableMiddleware?: boolean;
  autoForward?: {
    toBrowser?: string[];
    fromBrowser?: string[];
  };
}

export function createDesktopEventBus<T extends EventMap = EventMap>(
  options?: DesktopEventBusOptions,
): EventBus<T> & { ipc: IPCBridge } {
  const {
    domain = "global",
    maxListeners = 100,
    enableBridge = true,
    enableMiddleware = false,
    autoForward,
  } = options ?? {};

  const emitter = new EventEmitter();
  emitter.setMaxListeners(maxListeners);

  // Create the event context using Node's EventEmitter
  const context: EventContext = {
    emit: (eventName, data) => emitter.emit(eventName, data),
    on: (eventName, listener) => emitter.on(eventName, listener),
    once: (eventName, listener) => emitter.once(eventName, listener),
    off: (eventName, listener) => emitter.off(eventName, listener),
    removeAllListeners: () => emitter.removeAllListeners(),
    listenerCount: (eventName) => emitter.listenerCount(eventName),
    listenerMap: new WeakMap(),
    domain,
  };

  // Create the base event bus
  const bus = createBaseEventBus<T>({
    domain,
    context,
    enableBridge,
    enableMiddleware,
  });

  // Add IPC support
  const ipc = createDesktopIPCHandler();

  // Set up auto-forwarding if configured
  if (autoForward && bus.bridge) {
    setupAutoForwarding(bus, ipc, autoForward);
  }

  return Object.assign(bus, { ipc });
}

// Local bus without IPC
export function createLocalEventBus<T extends EventMap = EventMap>(
  options?: Omit<DesktopEventBusOptions, "autoForward">,
): EventBus<T> {
  // Same as desktop but without IPC
  const opts = { ...options, enableBridge: false };
  return createDesktopEventBus<T>(opts) as EventBus<T>;
}
```

### 5. Factory Composition Pattern

**Browser** (`src/browser/index.ts`):

```typescript
export { createBrowserEventBus as createEventBus } from "#browser/bus/createBrowserEventBus";
export type { EventBus, EventMap } from "#core/types";
```

**Desktop** (`src/desktop/index.ts`):

```typescript
import { createDesktopEventBus, createLocalEventBus } from "#desktop/bus";

export function createEventBus<T extends EventMap = EventMap>(options?: {
  domain?: string;
  useIPC?: boolean;
  maxListeners?: number;
  enableMiddleware?: boolean;
  autoForward?: AutoForwardConfig;
}): EventBus<T> {
  const { useIPC = true, ...rest } = options ?? {};

  return useIPC ? createDesktopEventBus<T>(rest) : createLocalEventBus<T>(rest);
}

export type { EventBus, EventMap } from "#core/types";
```

## Migration Mapping

| Current File                               | New Location                                           | Notes                                    |
| ------------------------------------------ | ------------------------------------------------------ | ---------------------------------------- |
| `types.ts`                                 | Split → `src/core/types/`                              | Separate into bus.ts, events.ts, ipc.ts  |
| `utils.ts`                                 | Split → `src/core/utils/`                              | Separate utilities into individual files |
| `shared.ts`                                | `src/shared/createBaseEventBus.ts` + `EventContext.ts` | Convert to factory functions             |
| `ipc.ts`                                   | Split → Browser & Desktop bridge folders               | Environment-specific implementations     |
| `ipc.test.ts`                              | `src/desktop/bridge/DesktopIPCHandler.test.ts`         | Co-locate with implementation            |
| `eventBus.test.ts`                         | `src/desktop/bus/createDesktopEventBus.test.ts`        | Co-locate with factory                   |
| `eventBus.bench.ts`                        | `src/desktop/bus/createDesktopEventBus.bench.ts`       | Co-locate with factory                   |
| `exports/browser/createBrowserEventBus.ts` | `src/browser/bus/createBrowserEventBus.ts`             | Keep as factory                          |
| `exports/browser/index.ts`                 | `src/browser/index.ts`                                 | Export factory                           |
| `exports/desktop/createDesktopEventBus.ts` | `src/desktop/bus/createDesktopEventBus.ts`             | Keep as factory                          |
| `exports/desktop/createLocalEventBus.ts`   | `src/desktop/bus/createLocalEventBus.ts`               | Keep as factory                          |
| `exports/desktop/setupAutoForwarding.ts`   | `src/desktop/bridge/setupAutoForwarding.ts`            | Keep as utility function                 |

## Package Configuration

### package.json

```json
{
  "name": "@yourorg/events-redux",
  "version": "2.0.0",
  "type": "module",
  "imports": {
    "#core/*": "./src/core/*",
    "#browser/*": "./src/browser/*",
    "#desktop/*": "./src/desktop/*",
    "#shared/*": "./src/shared/*"
  },
  "exports": {
    "./browser": {
      "import": "./dist/browser/index.mjs",
      "require": "./dist/browser/index.cjs",
      "types": "./dist/types/browser/index.d.ts"
    },
    "./desktop": {
      "import": "./dist/node/index.mjs",
      "require": "./dist/node/index.cjs",
      "types": "./dist/types/desktop/index.d.ts"
    },
    "./types": {
      "types": "./dist/types/core/types/index.d.ts"
    }
  },
  "scripts": {
    "test": "vitest run src",
    "test:watch": "vitest watch src",
    "test:integration": "vitest run tests/integration",
    "bench": "vitest bench --config vitest.bench.config.ts"
  }
}
```

## Benefits of This Refactor (Functional Approach)

1. **No Class Inheritance**: Using factory functions and composition instead of
   classes
2. **Better Organization**: Clear separation between environments with
   co-located tests
3. **Increased Flexibility**: Browser can now use custom domains
4. **Integrated Features**: Auto-forwarding and IPC bridge are first-class
   citizens
5. **Composition Over Inheritance**: Shared logic via `createBaseEventBus`
   factory
6. **Enhanced API**: Bridge API makes cross-environment communication explicit
7. **Improved Testing**: Co-located tests are easier to maintain
8. **Type Safety**: Using `implements` pattern with interfaces
9. **Functional Programming**: Stays true to functional programming principles

## Breaking Changes

None! The refactor maintains backward compatibility:

- Factory functions keep the same signature
- All existing methods work identically
- New features are additive (bridge API, middleware)

## Migration Checklist

- [ ] Create new folder structure in `src/`
- [ ] Move existing files to `ORGANIZE_ME/`
- [ ] Split `types.ts` into separate type files
- [ ] Split `utils.ts` into individual utility files
- [ ] Extract `BaseEventBus` from `shared.ts`
- [ ] Convert browser implementation to class-based
- [ ] Convert desktop implementations to classes
- [ ] Split IPC into browser and desktop implementations
- [ ] Integrate auto-forwarding into DesktopEventBus
- [ ] Co-locate unit tests with source files
- [ ] Co-locate benchmarks with source files
- [ ] Move integration tests to `tests/integration/`
- [ ] Update all imports to use subpath imports
- [ ] Update package.json with new structure
- [ ] Test both browser and desktop builds

---

# Prompt for Claude Code

**Instructions for Claude Code:**

I have an events package that provides cross-environment event emitter
functionality with IPC bridging between browser and desktop. All the existing
code has been moved to `src/ORGANIZE_ME/` folder. Your task is to reorganize it
following a FUNCTIONAL PROGRAMMING approach outlined in this document - NO
CLASSES, only factory functions and composition.

**Current files in ORGANIZE_ME:**

- `eventBus.bench.ts` - Benchmarks for the event bus
- `eventBus.test.ts` - Unit tests for the event bus
- `exports/browser/createBrowserEventBus.ts` - Browser event bus factory
- `exports/browser/index.ts` - Browser exports
- `exports/desktop/createDesktopEventBus.test.ts` - Desktop event bus tests
- `exports/desktop/createDesktopEventBus.ts` - Desktop event bus factory
- `exports/desktop/createLocalEventBus.ts` - Local (non-IPC) event bus
- `exports/desktop/index.ts` - Desktop exports
- `exports/desktop/setupAutoForwarding.ts` - Auto-forwarding utility
- `ipc.test.ts` - IPC bridge tests
- `ipc.ts` - IPC bridge implementation
- `shared.ts` - Shared event bus implementation logic
- `types.ts` - Type definitions
- `utils.ts` - Utility functions

Please help me reorganize using FACTORY FUNCTIONS and COMPOSITION (no classes):

1. **Create the new folder structure** as specified in the document
2. **Reorganize and refactor the code using factories**:
   - Split `types.ts` into `core/types/bus.ts`, `core/types/events.ts`, and
     `core/types/ipc.ts`
   - Split `utils.ts` into separate files in `core/utils/`
   - Create `createBaseEventBus` factory function for shared logic (NOT a class)
   - Keep all implementations as factory functions
   - Split IPC implementation for browser and desktop
3. **Co-locate tests and benchmarks** with their source files
4. **Add the new bridge API** to the EventBus interface:
   - Create `EventBridge` interface with `forward()`, `isForwarded()`,
     `stopForwarding()` methods
   - Implement as an object returned by factories when `enableBridge: true`
5. **Make browser implementation flexible** (accept domain parameter)
6. **Integrate auto-forwarding** as a utility function that enhances the event
   bus
7. **Update all imports** to use Node.js subpath imports (`#core/*`,
   `#browser/*`, etc.)
8. **Keep factory functions** in browser/index.ts and desktop/index.ts
9. **Move integration tests** to `tests/integration/` folder

**Key Requirements:**

- NO ES6 CLASSES - use factory functions and object composition
- Use `implements` pattern with TypeScript interfaces, not class inheritance
- Maintain backward compatibility - existing API must continue to work
- Browser code must have NO Node.js dependencies
- Desktop code can use Node.js APIs freely
- EventEmitter3 for browser, Node's EventEmitter for desktop
- Preserve domain-based event isolation
- Keep type safety throughout
- Tests should remain passing after refactor

**Factory Pattern Example to Follow:**

```typescript
// Instead of: class BrowserEventBus extends BaseEventBus
// Use: factory functions with shared logic

function createBaseEventBus<T>(options) {
  // Shared implementation
  return {
    emit: ...,
    on: ...,
    bridge: options.enableBridge ? createBridge() : undefined
  };
}

function createBrowserEventBus<T>(options) {
  const base = createBaseEventBus(options);
  // Browser-specific enhancements
  return { ...base, /* browser specifics */ };
}
```

**After reorganizing, provide:**

1. Summary of files moved and created
2. Any issues encountered
3. How you maintained the functional approach
4. Confirmation that backward compatibility is maintained
