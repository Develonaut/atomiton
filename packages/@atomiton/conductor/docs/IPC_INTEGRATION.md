# IPC Integration Strategy

## Overview

This document outlines how the runtime package integrates with @atomiton/events to provide seamless IPC (Inter-Process Communication) between Electron's renderer and main processes.

## Architecture

### Leveraging @atomiton/events

Instead of managing IPC directly, we use @atomiton/events as our unified event API:

```typescript
import { EventBus } from "@atomiton/events";

// Both renderer and main use the same API
const events = new EventBus();

// Renderer side
events.emit("runtime:execute", { blueprintId: "abc123" });

// Main side
events.on("runtime:execute", async (data) => {
  const result = await runtime.execute(data.blueprintId);
  events.emit("runtime:result", result);
});
```

### Implementation Details

The @atomiton/events package abstracts the IPC complexity:

```typescript
// Inside @atomiton/events
class EventBus {
  constructor() {
    if (isMainProcess()) {
      // Set up IPC handlers in main
      ipcMain.on("event", (event, channel, data) => {
        this.emitter.emit(channel, data);
      });
    } else if (isRenderer()) {
      // Set up IPC in renderer
      this.emit = (channel, data) => {
        ipcRenderer.send("event", channel, data);
      };
    }
  }
}
```

## Event Categories

### Execution Control Events

```typescript
// Renderer → Main
"runtime:execute"; // Start Blueprint execution
"runtime:pause"; // Pause execution
"runtime:resume"; // Resume execution
"runtime:cancel"; // Cancel execution

// Main → Renderer
"runtime:started"; // Execution started
"runtime:progress"; // Progress update
"runtime:completed"; // Execution completed
"runtime:error"; // Execution error
```

### Data Flow Events

```typescript
// Renderer → Main
"runtime:input"; // Send input data
"runtime:config"; // Update node config

// Main → Renderer
"runtime:output"; // Node output data
"runtime:state"; // Execution state update
```

### Debug Events

```typescript
// Main → Renderer
"runtime:log"; // Log messages
"runtime:breakpoint"; // Breakpoint hit
"runtime:inspect"; // Inspection data
```

## Benefits of This Approach

### 1. Single API Surface

Developers don't need to know about IPC:

```typescript
// Same code works in both processes
events.on("someEvent", handler);
events.emit("someEvent", data);
```

### 2. Type Safety

Events can be fully typed:

```typescript
interface RuntimeEvents {
  "runtime:execute": { blueprintId: string };
  "runtime:progress": { percent: number; message: string };
}

const events = new EventBus<RuntimeEvents>();
events.emit("runtime:execute", { blueprintId: "123" }); // Type-checked!
```

### 3. Testability

Easy to mock for testing:

```typescript
class MockEventBus implements IEventBus {
  emit(event: string, data: any) {
    // Track emissions for assertions
  }
}
```

### 4. Future Flexibility

Can easily adapt to different communication methods:

- WebSocket for web deployment
- MessagePort for Web Workers
- Direct function calls for same-process

## Implementation Plan

### Phase 1: Basic IPC

- [ ] Extend @atomiton/events with IPC support
- [ ] Define runtime event types
- [ ] Create typed event interfaces
- [ ] Set up bidirectional communication

### Phase 2: Advanced Features

- [ ] Add event batching for performance
- [ ] Implement event replay for debugging
- [ ] Add event filtering and routing
- [ ] Create event middleware system

### Phase 3: Optimization

- [ ] Use SharedArrayBuffer for large data
- [ ] Implement event compression
- [ ] Add connection pooling
- [ ] Optimize serialization

## Code Example

### Runtime Side (Main Process)

```typescript
import { EventBus } from "@atomiton/events";
import { Runtime } from "./Runtime";

export class RuntimeIPC {
  private events = new EventBus();
  private runtime = new Runtime();

  initialize() {
    // Listen for execution requests
    this.events.on("runtime:execute", async ({ blueprintId, input }) => {
      try {
        // Start execution
        const executionId = await this.runtime.execute(blueprintId, input);

        // Send started event
        this.events.emit("runtime:started", { executionId });

        // Stream progress
        this.runtime.onProgress(executionId, (progress) => {
          this.events.emit("runtime:progress", { executionId, ...progress });
        });

        // Wait for completion
        const result = await this.runtime.waitForCompletion(executionId);
        this.events.emit("runtime:completed", { executionId, result });
      } catch (error) {
        this.events.emit("runtime:error", { error: error.message });
      }
    });
  }
}
```

### Editor Side (Renderer Process)

```typescript
import { EventBus } from "@atomiton/events";

export class RuntimeClient {
  private events = new EventBus();

  async executeBlueprint(blueprintId: string, input?: any) {
    return new Promise((resolve, reject) => {
      // Listen for completion
      this.events.once("runtime:completed", ({ result }) => {
        resolve(result);
      });

      // Listen for errors
      this.events.once("runtime:error", ({ error }) => {
        reject(new Error(error));
      });

      // Trigger execution
      this.events.emit("runtime:execute", { blueprintId, input });
    });
  }

  onProgress(callback: (progress: any) => void) {
    this.events.on("runtime:progress", callback);
  }
}
```

## Security Considerations

### Event Validation

All events crossing the IPC boundary are validated:

```typescript
const eventSchema = z.object({
  blueprintId: z.string().uuid(),
  input: z.record(z.unknown()).optional(),
});

events.on("runtime:execute", (data) => {
  const validated = eventSchema.parse(data);
  // Process validated data only
});
```

### Permission Control

Certain events require permissions:

```typescript
if (!hasPermission("execute:blueprint")) {
  throw new Error("Permission denied");
}
```

## Performance Considerations

### Batching

Group multiple events for efficiency:

```typescript
events.batch([
  { type: "runtime:log", data: log1 },
  { type: "runtime:log", data: log2 },
  { type: "runtime:log", data: log3 },
]);
```

### Throttling

Limit high-frequency events:

```typescript
const throttledProgress = throttle((progress) => {
  events.emit("runtime:progress", progress);
}, 100); // Max every 100ms
```

## Next Steps

1. Extend @atomiton/events with IPC capabilities
2. Define complete event type definitions
3. Implement runtime IPC handlers
4. Create client-side SDK
5. Add comprehensive testing

---

**Last Updated**: 2025-01-11
**Status**: Design complete, implementation pending
