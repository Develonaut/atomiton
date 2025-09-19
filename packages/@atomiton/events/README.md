# @atomiton/events

Simple, type-safe event system with IntelliSense discovery for all Atomiton events.

## Quick Start

```typescript
import { events } from "@atomiton/events";

// IntelliSense shows ALL available events when you type!
events.on("ui:node:selected", ({ nodeId, position }) => {
  console.log(`Node ${nodeId} selected at`, position);
});

events.emit("ui:node:selected", {
  nodeId: "node-123",
  position: { x: 100, y: 200 },
});
```

## Why This Design?

1. **Discovery** - All events show up in IntelliSense automatically
2. **Type Safety** - Can't emit or listen to invalid events
3. **Simplicity** - Just `events.on()` and `events.emit()`
4. **Web-Friendly** - Familiar API from the web world
5. **Centralized** - All events defined in one place

## Available Events

All events are defined in the central registry. When you type `events.on('')` or `events.emit('')`, IntelliSense will show you everything:

### UI Events

- `ui:node:selected` - Node selection in editor
- `ui:node:added` - New node added
- `ui:canvas:zoom` - Canvas zoom level changed
- `ui:file:saved` - File saved
- ...and more

### Conductor Events

- `conductor:execute` - Start execution
- `conductor:result` - Execution completed
- `conductor:error` - Execution error
- `conductor:progress` - Progress update
- ...and more

### System Events

- `system:ready` - Application ready
- `system:error` - System error occurred
- `system:shutdown` - Application shutting down
- ...and more

## Usage Examples

### React Component

```typescript
import { events } from "@atomiton/events";
import { useEffect } from "react";

function NodeEditor() {
  useEffect(() => {
    // Type-safe with full IntelliSense
    const unsubscribe = events.on('ui:node:selected', ({ nodeId }) => {
      setSelectedNode(nodeId);
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  const handleNodeClick = (nodeId: string) => {
    events.emit('ui:node:selected', {
      nodeId,
      position: { x: 0, y: 0 }
    });
  };

  return <div>...</div>;
}
```

### Conductor Integration

```typescript
import { events } from "@atomiton/events";

// Listen for execution results
events.on("conductor:result", ({ executionId, output }) => {
  console.log(`Execution ${executionId} completed:`, output);
  updateUI(output);
});

// Start an execution
events.emit("conductor:execute", {
  blueprintId: "my-blueprint",
  executionId: "exec-123",
  params: { input: "data" },
});

// Handle errors
events.on("conductor:error", ({ executionId, error }) => {
  console.error(`Execution ${executionId} failed:`, error);
});
```

### Store Updates

```typescript
import { events } from "@atomiton/events";

// Listen for storage events
events.on("storage:blueprint:saved", ({ blueprintId, timestamp }) => {
  showNotification(`Blueprint ${blueprintId} saved`);
});

// Emit when blueprint is modified
events.emit("editor:blueprint:modified", {
  blueprintId: "bp-123",
  changes: {
    /* ... */
  },
});
```

### Creating Your Own Event Manager

```typescript
import { Events } from "@atomiton/events";

// Use the default registry (all system events)
const myEvents = Events();

// Or define custom events
type CustomEvents = {
  "app:started": void;
  "user:action": { action: string; userId: string };
  "data:update": { id: string; data: any };
};

const customEvents = Events<CustomEvents>();
customEvents.on("user:action", ({ action, userId }) => {
  console.log(`User ${userId} performed ${action}`);
});
```

## Browser vs Desktop

The package automatically detects the environment:

```typescript
// Auto-detect (recommended)
import { events } from "@atomiton/events";

// Explicitly use browser version (EventEmitter3)
import { events } from "@atomiton/events/browser";

// Explicitly use desktop version (Node EventEmitter)
import { events } from "@atomiton/events/desktop";
```

## API Reference

### `Events<T>(options?)`

Creates an event manager.

```typescript
const events = Events(); // Uses default event registry
const custom = Events<MyEvents>(); // Custom events
```

### `events.on(event, handler)`

Subscribe to an event. Returns an unsubscribe function.

```typescript
const unsubscribe = events.on("ui:node:selected", (data) => {
  // Handle event
});

// Later...
unsubscribe();
```

### `events.emit(event, data)`

Emit an event with data.

```typescript
events.emit("ui:node:selected", { nodeId: "123" });
```

### `events.once(event, handler)`

Subscribe to an event once. Auto-unsubscribes after first emission.

```typescript
events.once("system:ready", () => {
  console.log("System ready!");
});
```

### `events.off(event, handler)`

Remove a specific event listener.

```typescript
events.off("ui:node:selected", myHandler);
```

### `events.removeAllListeners()`

Remove all event listeners.

```typescript
events.removeAllListeners();
```

### `events.listenerCount(event)`

Get the number of listeners for an event.

```typescript
const count = events.listenerCount("ui:node:selected"); // 3
```

## Type Safety

The system is fully type-safe:

```typescript
// ✅ Correct - IntelliSense helps you
events.emit("ui:node:selected", { nodeId: "123", position: { x: 0, y: 0 } });

// ❌ Error - Wrong event name (caught at compile time)
events.emit("ui:node:selectd", { nodeId: "123" });
//                     ^^^^^^^ Event doesn't exist

// ❌ Error - Wrong payload type
events.emit("ui:node:selected", { id: "123" });
//                                 ^^ Should be nodeId

// ❌ Error - Missing required fields
events.emit("ui:node:selected", { nodeId: "123" });
//                               ^^^^^^^^^^^^^^^^ Missing position
```

## Migration from Old API

The old `createEventBus` API is still available for backward compatibility:

```typescript
// Old way (deprecated but still works)
import { createEventBus } from "@atomiton/events";
const bus = createEventBus<MyEvents>("domain");
bus.on("event", handler);

// New way (recommended)
import { events } from "@atomiton/events";
events.on("event", handler);
```

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
