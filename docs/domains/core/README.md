# @atomiton/core Domain

## Purpose

Foundation layer providing core abstractions, types, interfaces, and shared utilities for the entire Atomiton platform.

## Status: 🟢 Existing Code Available

We have a solid foundation from the previous implementation that includes:

- Platform detection and abstraction
- Storage client architecture
- Execution client system
- Event bus implementation
- State management

## Key Interfaces

```typescript
// Platform detection
interface PlatformInfo {
  platform: "desktop" | "browser" | "mobile";
  features: PlatformFeatures;
}

// Storage abstraction
interface IStorageClient {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Execution abstraction
interface IExecutionClient {
  spawn(command: string, args: string[]): ProcessHandle;
  exec(command: string): Promise<ProcessResult>;
}

// Event system
interface SystemEvent {
  type: string;
  payload: any;
  timestamp: number;
}
```

## Architecture Patterns

### Storage Strategy (Better than n8n)

- **FileSystemClient**: Desktop file access (n8n can't do this)
- **IndexedDBClient**: Browser fallback
- **MemoryClient**: Testing and development
- **MonitoredStorageClient**: With debugging instrumentation

### Execution Strategy (Simpler than n8n)

- **NodeProcessClient**: Run system commands
- **WebWorkerClient**: Sandboxed browser execution
- No Redis/Bull complexity like n8n

### Event System (Similar to n8n)

- Central event bus for loose coupling
- Type-safe event definitions
- Real-time subscriptions

## Dependencies

- None (foundation layer)
- This package has zero external dependencies by design

## Integration Points

- All other domains depend on @atomiton/core
- Provides types and interfaces for entire system
- Event bus connects all domains

## Current Implementation

```
packages/core/
├── src/
│   ├── clients/         # Storage and execution clients
│   ├── platforms/       # Platform detection
│   ├── store/          # State management
│   ├── theme/          # Theme system (may move)
│   └── visualization/  # Adapter pattern (may move to editor)
```

## Roadmap

### ✅ Phase 1: Foundation (Complete)

- [x] Platform detection system
- [x] Storage client abstraction
- [x] Execution client abstraction
- [x] Event system
- [x] Basic state management

### 🟡 Phase 2: Enhancement (Current - Week 1)

- [ ] Add TypeScript strict mode
- [ ] Implement DI pattern from n8n
- [ ] Add service decorators
- [ ] Create container system
- [ ] Comprehensive error types

### 🔴 Phase 3: Integration (Week 2)

- [ ] Wire to UI components
- [ ] Connect to Blueprint editor
- [ ] Integrate with workflow engine
- [ ] Add monitoring hooks

### 🔴 Phase 4: Optimization (Week 3)

- [ ] Add caching layer
- [ ] Implement connection pooling
- [ ] Add performance metrics
- [ ] Memory optimization

## Usage Examples

### Platform Detection

```typescript
import { detectPlatform, getPlatformInfo } from "@atomiton/core";

const platform = await detectPlatform();
if (platform === "desktop") {
  // Use FileSystemClient
} else {
  // Use IndexedDBClient
}
```

### Storage Client

```typescript
import { ClientFactory } from "@atomiton/core";

const storage = ClientFactory.createStorageClient();
await storage.set("blueprint:123", blueprintData);
const data = await storage.get("blueprint:123");
```

### Event System

```typescript
import { eventClient } from "@atomiton/core";

// Subscribe
eventClient.on("workflow:started", (event) => {
  console.log("Workflow started:", event.payload);
});

// Emit
eventClient.emit("workflow:started", { id: "123" });
```

## Testing Strategy

- Unit tests for each client implementation
- Integration tests for client factory
- Mock implementations for testing
- Platform detection stubs

## Performance Targets

- Platform detection: < 1ms
- Storage operations: < 10ms local, < 50ms indexed
- Event emission: < 1ms
- Memory baseline: < 5MB

## Migration Notes

Current code is solid but needs:

1. TypeScript strict mode
2. Better error handling
3. DI pattern for testing
4. Comprehensive documentation

---

**Status**: 🟢 Code exists, needs enhancement  
**Priority**: Critical (foundation)  
**Lead**: Michael (System Architect)  
**Last Updated**: January 2, 2025
