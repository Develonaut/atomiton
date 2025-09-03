# Atomiton Domain Architecture

## Overview

Atomiton follows a domain-driven architecture inspired by n8n's successful patterns while avoiding their complexity. Each domain is a self-contained package with clear boundaries, its own roadmap, and specific responsibilities.

## Core Domains

### 🧠 [@atomiton/di](./di/) - Dependency Injection

**Status**: 🔴 Not Started  
**Priority**: Critical (Foundation)  
**n8n Pattern**: Lightweight DI with decorators  
**Our Improvement**: TypeScript 5.0 decorators, better type inference

### 🎯 [@atomiton/core](./core/) - Core Abstractions

**Status**: 🟡 Planning  
**Priority**: Critical (Foundation)  
**n8n Pattern**: Strong interfaces and type definitions  
**Our Improvement**: Streaming-first interfaces, better error types

### 🔄 [@atomiton/workflow](./workflow/) - Workflow Engine

**Status**: 🔴 Not Started  
**Priority**: High  
**n8n Pattern**: DAG execution with expression engine  
**Our Improvement**: Streaming execution, WebAssembly for expressions

### 🔌 [@atomiton/nodes](./nodes/) - Node System

**Status**: 🟡 Planning  
**Priority**: High  
**n8n Pattern**: Extensible node architecture  
**Our Improvement**: 20-50 quality nodes vs 500+ complexity

### 🎨 [@atomiton/editor](./editor/) - Visual Editor

**Status**: 🟢 In Progress (React Flow integrated)  
**Priority**: High  
**n8n Pattern**: Canvas-based workflow design  
**Our Improvement**: AI-assisted node connections

### ⚡ [@atomiton/runtime](./runtime/) - Execution Runtime

**Status**: 🔴 Not Started  
**Priority**: Medium  
**n8n Pattern**: Worker-based execution  
**Our Improvement**: Streaming, lower memory footprint

### 🤖 [@atomiton/ai](./ai/) - AI Integration

**Status**: 🔴 Not Started  
**Priority**: Medium  
**n8n Pattern**: Retrofitted AI nodes  
**Our Improvement**: Native AI assistance throughout

### 🎨 [@atomiton/theme](./theme/) - Brainwave Design System

**Status**: 🟡 Planning  
**Priority**: High (Differentiation)  
**n8n Pattern**: Basic component theming  
**Our Improvement**: Complete Brainwave 2.0 theme system, modern visual effects, beautiful by default

### 🖥️ [@atomiton/desktop](./desktop/) - Desktop Integration

**Status**: 🔴 Not Started  
**Priority**: Medium  
**n8n Pattern**: Web-only deployment  
**Our Improvement**: Desktop-first with full OS access

## Domain Relationships

```mermaid
graph TD
    DI[@atomiton/di] --> Core[@atomiton/core]
    Core --> Workflow[@atomiton/workflow]
    Core --> Nodes[@atomiton/nodes]
    Theme[@atomiton/theme] --> Editor[@atomiton/editor]
    Theme --> Core
    Workflow --> Runtime[@atomiton/runtime]
    Nodes --> Runtime
    Workflow --> Editor
    Nodes --> Editor
    Core --> AI[@atomiton/ai]
    AI --> Nodes
    Desktop[@atomiton/desktop] --> Editor
    Desktop --> Runtime
```

## n8n Patterns We're Adopting

### 1. Dependency Injection (Critical)

- Decorator-based service registration
- Lightweight alternative to NestJS
- Container-based dependency resolution
- Enables testing and modularity

### 2. Package Namespacing

- `@atomiton/*` for clear boundaries
- Prevents accidental cross-imports
- Enables independent versioning
- Professional package organization

### 3. Strong Type Contracts

- Interfaces define domain boundaries
- Runtime validation at edges
- Type-safe node connections
- Expression type checking

### 4. Plugin Architecture

- Nodes as plugins
- Hot-reloading in development
- Community node support
- Version compatibility

### 5. Event-Driven Communication

- Domains communicate via events
- Loose coupling between packages
- Real-time progress updates
- WebSocket support built-in

## Our Improvements Over n8n

### 1. Simpler Dependency Tree

- No TypeORM complexity
- SQLite instead of PostgreSQL
- p-queue instead of Bull/Redis
- Fewer transitive dependencies

### 2. Performance First

- Streaming architecture throughout
- WebAssembly for compute-intensive tasks
- Worker threads for parallelization
- 10-30x faster execution target

### 3. Desktop Native

- File system access without restrictions
- OS integration (notifications, tray)
- Local-first, offline-capable
- No CORS or security limitations

### 4. AI Throughout

- AI-assisted node creation
- Workflow optimization suggestions
- Natural language to Blueprint
- Intelligent error recovery

## Development Principles

### For Each Domain

1. **Single Responsibility**: One domain, one purpose
2. **Clear Interfaces**: Well-defined public API
3. **Isolated Testing**: Domain tests run independently
4. **Documentation**: README, ROADMAP, and examples
5. **Performance Metrics**: Clear benchmarks and targets

### Cross-Domain Rules

1. **No Circular Dependencies**: Enforce with tooling
2. **Event-Based Communication**: Use event bus for loose coupling
3. **Type-Safe Boundaries**: Validate at domain edges
4. **Streaming by Default**: Process data in chunks
5. **Progressive Enhancement**: Graceful degradation

## Getting Started with a Domain

Each domain contains:

- `README.md` - Overview and quick start
- `ROADMAP.md` - Development phases and progress
- `PATTERNS.md` - n8n patterns and our improvements
- `src/` - Implementation
- `tests/` - Domain-specific tests
- `examples/` - Usage examples

## Success Metrics

### Domain Health

- Build time < 5 seconds
- Test coverage > 80%
- Bundle size within limits
- Zero circular dependencies
- Documentation current

### Overall Architecture

- < 10 second full rebuild
- < 100MB memory baseline
- < 1MB web bundle
- 100% TypeScript strict mode
- All domains documented

## Next Steps

1. **Create @atomiton/di package** (n8n's best pattern)
2. **Define core interfaces** in @atomiton/core
3. **Build minimal workflow engine** with streaming
4. **Implement 5 essential nodes** for testing
5. **Connect editor to engine** for visual testing

---

**Last Updated**: January 2, 2025  
**Status**: Domain architecture overview  
**Next Review**: After first domain implementation
