# @atomiton/core

Foundation layer providing core abstractions, types, interfaces, and shared utilities for the entire Atomiton platform.

## Table of Contents

- [Progress Tracking](#-progress-tracking)
- [Overview](#overview)
- [Features](#features)
  - [Platform Detection](#platform-detection)
  - [Storage Abstraction](#storage-abstraction)
  - [Event System](#event-system)
  - [State Management](#state-management)
  - [Error Handling](#error-handling)
  - [Execution Engine](#execution-engine)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Testing](#testing)
- [Contributing](#contributing)

## 📊 Progress Tracking

- **[Current Work](./CURRENT.md)** - Active development tasks
- **[Upcoming Features](./NEXT.md)** - Planned improvements
- **[Release History](./COMPLETED.md)** - Completed features
- **[Roadmap](./ROADMAP.md)** - Long-term vision

## Overview

The core package provides essential platform abstractions and utilities that all other packages depend on. It's designed to be lightweight, with zero external dependencies, serving as the foundation for the Atomiton ecosystem.

## Features

### Platform Detection

Detect and adapt to different runtime environments:

- Desktop (Electron)
- Browser (Web)
- Mobile (future)

### Storage Abstraction

Unified storage interface with multiple implementations:

- **FileSystemClient** - Direct file system access for desktop
- **IndexedDBClient** - Browser-based storage
- **MemoryClient** - In-memory storage for testing
- **MonitoredStorageClient** - Storage with debugging

### Execution Clients

Run processes and scripts:

- **NodeProcessClient** - System command execution
- **WebWorkerClient** - Sandboxed browser execution

### Event System

Central event bus for loose coupling between components:

- Type-safe event definitions
- Real-time subscriptions
- Event replay for debugging

### State Management

Zustand-based stores for application state:

- Blueprint store
- Execution store
- Session store
- UI store

## Installation

```bash
pnpm add @atomiton/core
```

## Usage

### Platform Detection

```typescript
import { detectPlatform, getPlatformInfo } from "@atomiton/core";

const platform = await detectPlatform();
const info = getPlatformInfo();

if (info.features.fileSystem) {
  // Use file system features
}
```

### Storage Client

```typescript
import { ClientFactory } from "@atomiton/core";

const storage = ClientFactory.createStorageClient();
await storage.set("key", { data: "value" });
const data = await storage.get("key");
await storage.delete("key");
```

### Event System

```typescript
import { eventClient } from "@atomiton/core";

// Subscribe to events
eventClient.on("workflow:started", (event) => {
  console.log("Workflow started:", event.payload);
});

// Emit events
eventClient.emit("workflow:started", {
  id: "123",
  name: "My Workflow",
});
```

### State Management

```typescript
import { createBlueprintStore } from "@atomiton/core";

const store = createBlueprintStore();
const state = store.getState();
store.setState({ blueprint: newBlueprint });
```

## Architecture

```
packages/core/
├── src/
│   ├── clients/         # Storage and execution implementations
│   │   ├── storage/
│   │   └── execution/
│   ├── platforms/       # Platform detection and capabilities
│   ├── store/          # Zustand state management
│   ├── services/       # Core services
│   └── utils/          # Shared utilities
├── docs/               # Additional documentation
│   └── ANALYSIS.md    # Code analysis
└── tests/             # Test suites
```

## API Reference

### Interfaces

```typescript
interface IStorageClient {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

interface IExecutionClient {
  spawn(command: string, args: string[]): ProcessHandle;
  exec(command: string): Promise<ProcessResult>;
  kill(handle: ProcessHandle): Promise<void>;
}

interface SystemEvent {
  type: string;
  payload: any;
  timestamp: number;
  source?: string;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Testing

The package includes comprehensive test coverage:

- Unit tests for each client implementation
- Integration tests for factory patterns
- Mock implementations for testing
- Platform detection stubs

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Performance

Target metrics:

- **Platform detection**: < 1ms
- **Storage operations**: < 10ms (local), < 50ms (IndexedDB)
- **Event emission**: < 1ms
- **Memory baseline**: < 5MB
- **Bundle size**: < 20KB gzipped

## Future Plans

See [ROADMAP.md](./ROADMAP.md) for detailed plans including:

- Package decomposition into focused modules
- Dependency injection system
- Performance optimizations
- Advanced caching strategies

## Contributing

This is a core package - changes affect the entire platform. Please:

1. Discuss major changes in issues first
2. Maintain backward compatibility
3. Add tests for new features
4. Update documentation

## License

MIT - See [LICENSE](../../LICENSE) for details

---

**Package Status**: 🟡 Active Development
**Version**: 0.1.0
**Stability**: Beta
