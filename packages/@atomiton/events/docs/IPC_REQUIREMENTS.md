# IPC Requirements for @atomiton/events

## Overview

The @atomiton/conductor package requires IPC (Inter-Process Communication) support in the events package to enable communication between Electron's renderer process (where the editor runs) and the main process (where Blueprint execution happens).

## Requirements

### 1. Unified API

Developers should use the same event API regardless of which process they're in:

```typescript
// Same API in both renderer and main processes
import { EventBus } from "@atomiton/events";

const events = new EventBus();
events.on("conductor:execute", handler);
events.emit("conductor:execute", data);
```

### 2. Automatic Process Detection

The EventBus should automatically detect its execution context:

```typescript
class EventBus {
  constructor() {
    if (this.isMainProcess()) {
      this.setupMainProcessHandlers();
    } else if (this.isRendererProcess()) {
      this.setupRendererHandlers();
    }
  }

  private isMainProcess(): boolean {
    return (
      typeof window === "undefined" &&
      typeof process !== "undefined" &&
      process.type === "browser"
    );
  }

  private isRendererProcess(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof process !== "undefined" &&
      process.type === "renderer"
    );
  }
}
```

### 3. Type-Safe Event Definitions

Support for typed events across IPC boundary:

```typescript
interface ConductorEvents {
  "conductor:execute": {
    blueprintId: string;
    input?: unknown;
  };
  "conductor:result": {
    executionId: string;
    result: ExecutionResult;
  };
  "conductor:progress": {
    executionId: string;
    percent: number;
    message?: string;
  };
}

const events = new EventBus<ConductorEvents>();
// Type-safe!
events.emit("conductor:execute", { blueprintId: "123" });
```

### 4. Bidirectional Communication

Support events flowing in both directions:

#### Renderer → Main

- Execute Blueprint commands
- Configuration updates
- User interactions

#### Main → Renderer

- Execution progress
- Log messages
- State updates
- Error notifications

### 5. Data Serialization

Handle complex data types that need to cross the IPC boundary:

```typescript
class IPCSerializer {
  static serialize(data: any): string {
    return JSON.stringify(data, (key, value) => {
      // Handle special types
      if (value instanceof Date) {
        return { __type: "Date", value: value.toISOString() };
      }
      if (value instanceof Error) {
        return { __type: "Error", message: value.message, stack: value.stack };
      }
      return value;
    });
  }

  static deserialize(data: string): any {
    return JSON.parse(data, (key, value) => {
      if (value?.__type === "Date") {
        return new Date(value.value);
      }
      if (value?.__type === "Error") {
        const err = new Error(value.message);
        err.stack = value.stack;
        return err;
      }
      return value;
    });
  }
}
```

### 6. Performance Optimizations

#### Event Batching

Group multiple events for efficiency:

```typescript
class EventBatcher {
  private queue: Event[] = [];
  private timer?: NodeJS.Timeout;

  add(event: Event) {
    this.queue.push(event);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 10);
    }
  }

  private flush() {
    ipcRenderer.send("batch", this.queue);
    this.queue = [];
    this.timer = undefined;
  }
}
```

#### Connection State

Track IPC connection status:

```typescript
class IPCConnection {
  private connected = false;
  private reconnectTimer?: NodeJS.Timeout;

  onDisconnect() {
    this.connected = false;
    this.attemptReconnect();
  }

  private attemptReconnect() {
    // Exponential backoff
  }
}
```

## Implementation Priority

1. **Week 1**: Basic IPC wrapper around EventEmitter3
2. **Week 2**: Type-safe event definitions
3. **Week 3**: Serialization and error handling
4. **Week 4**: Performance optimizations

## Testing Strategy

### Unit Tests

- Process detection logic
- Serialization/deserialization
- Event routing

### Integration Tests

- Renderer ↔ Main communication
- Error scenarios
- Performance under load

### Mocking for Tests

```typescript
class MockIPCRenderer {
  private handlers = new Map();

  on(channel: string, handler: Function) {
    this.handlers.set(channel, handler);
  }

  send(channel: string, ...args: any[]) {
    // Track for assertions
  }
}
```

## Usage Example

### In Conductor Package (Main Process)

```typescript
import { EventBus } from "@atomiton/events";

class ConductorIPC {
  private events = new EventBus();

  initialize() {
    this.events.on("conductor:execute", async (data) => {
      const result = await this.conductor.execute(data.blueprintId);
      this.events.emit("conductor:result", result);
    });
  }
}
```

### In Editor (Renderer Process)

```typescript
import { EventBus } from "@atomiton/events";

class EditorClient {
  private events = new EventBus();

  async executeBlueprint(id: string) {
    return new Promise((resolve) => {
      this.events.once("conductor:result", resolve);
      this.events.emit("conductor:execute", { blueprintId: id });
    });
  }
}
```

## Dependencies

- `electron` (peer dependency)
- `eventemitter3` (already included)

## Timeline

- **Q1 2025 Week 1-2**: Implement basic IPC support
- **Q1 2025 Week 3-4**: Add optimizations and testing
- **Q1 2025 Week 5**: Integration with @atomiton/conductor

---

**Created**: 2025-01-11
**Required By**: @atomiton/conductor package
**Priority**: HIGH
