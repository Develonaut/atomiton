# @atomiton/events

Type-safe event system for Atomiton workflow automation with optional Electron
IPC support.

## Installation

```bash
pnpm add @atomiton/events
```

## Quick Start

### Browser Usage

```typescript
import { createEventBus } from "@atomiton/events/browser";

// Define your event types
type AppEvents = {
  "user:login": { userId: string; timestamp: number };
  "data:updated": { id: string; changes: any };
};

// Create a typed event bus
const bus = createEventBus<AppEvents>("app");

// Subscribe to events
const unsubscribe = bus.on("user:login", ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp}`);
});

// Emit events
bus.emit("user:login", { userId: "123", timestamp: Date.now() });

// Clean up
unsubscribe();
```

### Desktop Usage (Electron)

```typescript
import { createEventBus } from "@atomiton/events/desktop";

// Basic usage (local events only)
const localBus = createEventBus<MyEvents>("local");

// With IPC for cross-process communication
const ipcBus = createEventBus<MyEvents>("app", {
  ipc: {
    enabled: true,
    bridgeMode: "auto",
    forwardEvents: ["execute", "result"], // These events cross process boundaries
  },
});
```

## Core Concepts

### Event Bus

An event bus is an isolated communication channel for a specific domain. Events
from one bus don't leak to others.

```typescript
const uiBus = createEventBus<UIEvents>("ui");
const dataBus = createEventBus<DataEvents>("data");

// These are completely isolated
uiBus.on("update", handler); // Only receives UI updates
dataBus.on("update", handler); // Only receives data updates
```

### Type Safety

Full TypeScript support ensures you can't emit or listen to invalid events:

```typescript
type StrictEvents = {
  save: { filename: string; content: string };
  delete: { id: number };
};

const bus = createEventBus<StrictEvents>("files");

// ✅ Type-safe
bus.emit("save", { filename: "test.txt", content: "hello" });

// ❌ TypeScript error - wrong event name
bus.emit("update", { id: 1 });

// ❌ TypeScript error - wrong payload type
bus.emit("delete", { id: "not-a-number" });
```

## API Reference

### `createEventBus<T>(domain, config?)`

Creates a new event bus for the specified domain.

#### Parameters

- `domain: string` - Unique identifier for this bus (e.g., "ui", "data",
  "conductor")
- `config?: EventBusConfig` - Optional configuration

#### Browser Config

```typescript
type EventBusConfig = {
  maxListeners?: number; // Max listeners per event (default: 100)
};
```

#### Desktop Config

```typescript
type DesktopEventBusConfig = {
  maxListeners?: number;
  ipc?: {
    enabled: boolean;
    bridgeMode?: "auto" | "manual"; // auto = automatic forwarding
    forwardEvents?: string[]; // events to forward across processes
  };
};
```

### Event Bus Methods

#### `on(event, handler): () => void`

Subscribe to an event. Returns an unsubscribe function.

```typescript
const unsubscribe = bus.on("save", ({ filename }) => {
  console.log(`Saved ${filename}`);
});

// Later...
unsubscribe(); // Stop listening
```

#### `once(event, handler): () => void`

Subscribe to an event once. Automatically unsubscribes after first emission.

```typescript
bus.once("initialized", () => {
  console.log("App initialized");
});
```

#### `emit(event, data): void`

Emit an event with data.

```typescript
bus.emit("save", { filename: "doc.txt", content: "..." });
```

#### `off(event, handler): void`

Remove a specific event listener.

```typescript
const handler = (data) => console.log(data);
bus.on("update", handler);
bus.off("update", handler);
```

#### `removeAllListeners(): void`

Remove all event listeners.

```typescript
bus.removeAllListeners(); // Clean slate
```

#### `listenerCount(event): number`

Get the number of listeners for an event.

```typescript
console.log(bus.listenerCount("save")); // 3
```

#### `getDomain(): string`

Get the domain name of this bus.

```typescript
console.log(bus.getDomain()); // "ui"
```

## Real-World Examples

### React Hook Integration

```typescript
import { createEventBus } from "@atomiton/events/browser";
import { useEffect } from "react";

const editorBus = createEventBus<EditorEvents>("editor");

export function useEditorEvents() {
  useEffect(() => {
    const unsub = editorBus.on("node:selected", ({ nodeId }) => {
      // Update React state
    });

    return unsub;
  }, []);

  return {
    selectNode: (nodeId: string) => editorBus.emit("node:selected", { nodeId }),
  };
}
```

### Store Integration

```typescript
import { createEventBus } from "@atomiton/events";
import { createStore } from "@atomiton/store";

type StoreEvents = {
  "state:changed": { path: string; value: any };
};

export function createAppStore() {
  const bus = createEventBus<StoreEvents>("store");
  const store = createStore({
    /* ... */
  });

  // Emit events on state changes
  store.subscribe((state) => {
    bus.emit("state:changed", {
      path: "user",
      value: state.user,
    });
  });

  return { store, events: bus };
}
```

### Electron IPC Communication

```typescript
// Renderer process
const conductorBus = createEventBus<ConductorEvents>("conductor", {
  ipc: {
    enabled: true,
    bridgeMode: "auto",
    forwardEvents: ["execute", "result", "error"],
  },
});

// This automatically sends to main process via IPC
conductorBus.emit("execute", {
  nodeId: "transform-1",
  params: { operation: "uppercase" },
});

// Listen for results from main process
conductorBus.on("result", ({ nodeId, output }) => {
  updateUI(nodeId, output);
});
```

### Testing

```typescript
import { createEventBus } from "@atomiton/events/browser";
import { vi, test, expect } from "vitest";

test("should emit and receive events", () => {
  const bus = createEventBus<{ test: { value: number } }>("test");
  const handler = vi.fn();

  bus.on("test", handler);
  bus.emit("test", { value: 42 });

  expect(handler).toHaveBeenCalledWith({ value: 42 });
});
```

## Best Practices

### 1. Define Event Types

Always define your event types for better type safety:

```typescript
// ✅ Good
type Events = {
  save: { id: string; data: any };
  delete: { id: string };
};
const bus = createEventBus<Events>("app");

// ❌ Avoid
const bus = createEventBus<any>("app");
```

### 2. Use Domain Isolation

Create separate buses for different concerns:

```typescript
// ✅ Good - separated concerns
const uiBus = createEventBus<UIEvents>("ui");
const dataBus = createEventBus<DataEvents>("data");
const systemBus = createEventBus<SystemEvents>("system");

// ❌ Avoid - everything in one bus
const bus = createEventBus<AllEvents>("app");
```

### 3. Clean Up Listeners

Always clean up listeners to prevent memory leaks:

```typescript
// ✅ Good - using cleanup function
useEffect(() => {
  const unsub = bus.on("event", handler);
  return unsub; // Cleanup on unmount
}, []);

// ❌ Bad - no cleanup
useEffect(() => {
  bus.on("event", handler); // Memory leak!
}, []);
```

### 4. Use Specific Event Names

Use descriptive, namespaced event names:

```typescript
// ✅ Good - specific and namespaced
type Events = {
  "user:login": { userId: string };
  "user:logout": { userId: string };
  "file:saved": { path: string };
  "file:deleted": { path: string };
};

// ❌ Avoid - generic names
type Events = {
  update: any;
  change: any;
  action: any;
};
```

## Migration from Legacy API

If migrating from the old singleton API:

```typescript
// Old API
import { events } from "@atomiton/events";
events.emit(/* ... */);

// New API - use the default export for compatibility
import { events } from "@atomiton/events";
events.emit(/* ... */); // Still works

// Or better - create your own bus
import { createEventBus } from "@atomiton/events/browser";
const myBus = createEventBus<MyEvents>("myapp");
```

## Environment Detection

The desktop version can detect the Electron environment:

```typescript
const bus = createEventBus<Events>("app", {
  ipc: { enabled: true },
});

if (bus.ipc?.isAvailable()) {
  const env = bus.ipc.getEnvironment();
  console.log(`Running in ${env} process`);
  // "Running in renderer process" or "Running in main process"
}
```

## Performance Tips

1. **Limit Listeners**: Set `maxListeners` if you expect many listeners
2. **Use `once()`**: For one-time events to auto-cleanup
3. **Batch Events**: Combine related events when possible
4. **Selective IPC**: Only forward necessary events across processes

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

## License

MIT
