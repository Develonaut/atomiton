# Architecture Documentation

## Overview

This directory contains the system architecture documentation for Atomiton, focusing on core components, patterns, and integration strategies.

## Core Architecture

### Conductor - Blueprint Execution Engine

The conductor is Atomiton's unified execution engine that works consistently across all environments.

- **[Conductor API](./CONDUCTOR_API.md)** - Unified factory pattern and core API design
- **[Transport Architecture](./TRANSPORT_ARCHITECTURE.md)** - Cross-environment communication layer
- **[Electron Integration](./ELECTRON_ARCHITECTURE.md)** - Desktop application architecture and IPC flow
- **[BENTO_BOX_IMPLEMENTATION](./BENTO_BOX_IMPLEMENTATION.md)** - Simplicity and efficiency principles in action

### Node System

- **[Node Configuration System](./NODE_CONFIGURATION_SYSTEM.md)** - Configuration patterns for Blueprint nodes

## Key Principles

### BENTO_BOX_PRINCIPLE

The conductor package exemplifies our BENTO_BOX_PRINCIPLE:

- One unified API that works everywhere (`createConductor()`)
- Auto-detecting transport layer (no configuration needed)
- Progressive enhancement (start simple, add complexity only when needed)
- Clear separation of concerns (transport, execution, storage)

### Cross-Environment Consistency

The conductor provides identical APIs across:

- **Electron Renderer** - Uses IPC transport to main process
- **Electron Main** - Direct execution with full Node.js access
- **Browser** - HTTP transport to API server
- **Server/Node.js** - Local transport with direct execution

## Architecture Patterns

### Factory Pattern

```typescript
// Same API everywhere
const conductor = createConductor();
const result = await conductor.execute(request);
```

### Transport Abstraction

```typescript
// Auto-detects environment and uses appropriate transport
// IPC → Local → HTTP based on runtime environment
```

### Environment Detection

```typescript
// Automatic environment detection
if (window?.electron?.ipcRenderer) return "ipc"; // Electron renderer
if (window) return "http"; // Browser
return "local"; // Node.js/Electron main
```

## Performance Philosophy

The conductor demonstrates our "measure first, optimize later" approach:

- **Proven faster than competitors** (22-92% performance advantage in benchmarks)
- **Memory efficient** (<5MB overhead for complex workflows)
- **Fast failure detection** (<50ms vs 30+ seconds for competitors)
- **TypeScript-first** with room for multi-runtime expansion

## Related Documentation

### Development Guidelines

- **[Development Principles](../guides/DEVELOPMENT_PRINCIPLES.md)** - Core development philosophy
- **[Code Style](../guides/CODE_STYLE.md)** - Code quality standards

### Package Documentation

- **Conductor Package**: `packages/@atomiton/conductor/README.md`
- **Events Package**: `packages/@atomiton/events/README.md`
- **Nodes Package**: `packages/@atomiton/nodes/README.md`

---

**Navigation**: This README serves as the entry point to architecture documentation. Each linked document focuses on specific architectural concerns without duplication.
