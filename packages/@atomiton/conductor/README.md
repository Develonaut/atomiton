# @atomiton/conductor

> Blueprint and node execution orchestrator for Atomiton

## Overview

The conductor package orchestrates the execution of Blueprints and nodes in the Atomiton platform. Like a musical conductor leading an orchestra, it coordinates:

- Blueprint execution orchestration
- Node execution routing
- Data flow between nodes
- Execution state management
- IPC communication (via @atomiton/events)
- Error handling and recovery

## MVP Approach

### Why TypeScript-Only for MVP

We're intentionally starting with a **pure TypeScript/Node.js implementation** for our MVP. Here's why:

1. **Ship Fast**: Complexity kills projects. Single language = faster development.
2. **I/O Bound Reality**: Most automation workflows are I/O bound (network, disk), not CPU bound.
3. **Proven at Scale**: n8n, Zapier, and Make all use JavaScript/TypeScript successfully.
4. **Measure First**: We'll add performance optimizations based on real bottlenecks, not assumptions.

### Future Runtime Flexibility

While starting simple, our architecture is designed to support multiple runtimes in the future:

```typescript
// Future: Nodes can specify their runtime via versioning
interface INodeMetadata {
  version: "1.0.0"; // v1: TypeScript only
  // version: "2.0.0" might add: runtime: { language: 'rust' }
}
```

Node versioning ensures backward compatibility - existing workflows continue working while new versions can introduce runtime optimizations.

## Architecture

### Desktop-First Execution

```
┌──────────────┐     IPC      ┌──────────────┐     ┌──────────────┐
│   Editor     │   (events)   │  Conductor   │────>│ Node.js APIs │
│   (React)    │<─────────────>│  (Electron   │     │   (fs, cp)   │
└──────────────┘               │    Main)     │     └──────────────┘
                               └──────────────┘
```

### Core Components

- **ExecutionEngine**: Main orchestration class
- **BlueprintRunner**: Executes Blueprint workflows
- **NodeExecutor**: Executes individual nodes
- **StateManager**: Tracks execution state
- **IPCBridge**: Communication via @atomiton/events

## Status

🚧 **Development Starting** - Package structure defined, implementation pending.

See [ROADMAP.md](./ROADMAP.md) for detailed development timeline.

## Documentation

- [Architecture Overview](./docs/README.md)
- [Blueprint Execution](./docs/BLUEPRINT_EXECUTION.md)
- [Execution Strategy](./docs/EXECUTION_STRATEGY.md)
- [IPC Integration](./docs/IPC_INTEGRATION.md)

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev
```

## License

MIT
