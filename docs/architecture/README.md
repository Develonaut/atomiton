# Atomiton Architecture

## Vision & Overview

**Atomiton** is a visual automation platform that transforms complex workflows into reusable "Blueprints" through a node-based editor. Users create workflows by dragging and connecting nodes in a visual interface similar to Unreal Engine's Blueprint system, then execute these workflows as Jobs with real-time monitoring and progress tracking.

### The Dream

A platform where non-programmers can automate any repetitive task by visually connecting pre-built nodes, while developers can extend the system with custom nodes. Originally conceived for 3D rendering automation, Atomiton is designed as a general-purpose automation tool for any workflow composed of discrete, connected steps.

## Core Concepts

### Blueprints

- Visual workflow definitions created in the node editor
- Saved as YAML/JSON files for portability and version control
- Shareable and reusable across projects
- Can be nested (Blueprints can contain other Blueprints as nodes)

### Nodes

- Individual units of work with specific inputs and outputs
- Categories: Data, Processing, I/O, Control Flow, AI/ML
- Each node follows single responsibility principle
- Extensible through a plugin architecture

### Jobs

- Runtime instances of Blueprint executions
- Real-time progress tracking and monitoring
- Queued execution with resource management
- Comprehensive error handling and retry logic

### Visual Editor

- React Flow-based node editor with drag-and-drop
- Real-time connection validation
- Node palette with search and categorization
- Property panels for node configuration

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Vite + React)              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Blueprint  │  │     Node     │  │     Job      │       │
│  │    Editor    │  │    Palette   │  │   Monitor    │       │
│  │ (React Flow) │  │  (Mantine)   │  │  (Real-time) │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core API (@atomiton/core)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Blueprint  │  │   Execution  │  │    Event     │       │
│  │   Service    │  │    Engine    │  │    System    │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node System (@atomiton/nodes)             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │     Data    │  │  Processing  │  │     I/O      │       │
│  │    Nodes    │  │    Nodes     │  │    Nodes     │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Current State (What We Have)

- **Frontend**: Next.js 15.3.3 + Tailwind CSS
- **UI Components**: Basic React components
- **State Management**: Zustand (basic implementation)
- **Build System**: Turborepo with pnpm
- **Development**: Basic turborepo monorepo structure

### Target State (Where We're Going)

- **Frontend**: Vite + React + TypeScript
- **UI Library**: Mantine UI (data-heavy components with Compound pattern)
- **Visual Editor**: React Flow (node-based workflow editor)
- **State Management**: Zustand (production architecture)
- **Desktop**: Electron (cross-platform desktop app)
- **Data Validation**: Zod (runtime schema validation)
- **Execution Engine**: vm2 (sandboxed node execution)
- **Event System**: EventClient (already implemented ✅)
- **Storage**: YAML/JSON files for Blueprints
- **Queue System**: p-queue → BullMQ (as complexity grows)

## Package Structure

### Planned Monorepo Structure

```
atomiton/
├── apps/
│   ├── web/           # Main web application (currently Next.js → Vite)
│   ├── desktop/       # Electron desktop wrapper (future)
│   └── docs/          # Documentation site
├── packages/
│   ├── core/          # Brain/API - central services and business logic
│   ├── ui/            # Shared UI components (Mantine-based)
│   ├── nodes/         # Node library and registry
│   ├── blueprint-engine/ # Workflow execution runtime
│   ├── theme/         # Dracula theme and design tokens
│   └── shared/        # Common types and utilities
```

### Package Responsibilities

**@atomiton/core**

- Central API for entire application
- Blueprint management and persistence
- Job execution orchestration
- Platform detection and abstraction
- Event system and state management

**@atomiton/ui**

- Mantine-based component library
- Blueprint editor components
- Compound component patterns
- Consistent design system

**@atomiton/nodes**

- Base node classes and interfaces
- Built-in node implementations
- Node registry and discovery
- Validation and type checking

## Key Features

### Visual Blueprint Editor

- Drag-and-drop node creation
- Connection validation with type checking
- Real-time collaboration capabilities
- Undo/redo with history management
- Node search and categorization
- Property panels for configuration

### Execution Engine

- Sandboxed node execution (vm2)
- Parallel processing with worker threads
- Resource management and limits
- Progress tracking and cancellation
- Error handling and retry logic
- Real-time status updates via WebSockets

### Node Library

- Extensible plugin architecture
- Categories: Data, Processing, I/O, Control, AI/ML
- Hot-reloading for development
- Version compatibility management
- Community node marketplace (future)

### Platform Capabilities

- **Desktop (Primary)**: Full file system access, external process execution
- **Web (Secondary)**: Limited capabilities with progressive enhancement
- **File-based Storage**: Portable Blueprint definitions
- **Version Control**: Git-friendly YAML/JSON format

## Implementation Roadmap

### Phase 1: Foundation Migration

1. Migrate from Next.js to Vite
2. Replace Tailwind with Mantine UI
3. Add packages/core from previous repository
4. Add packages/nodes from previous repository
5. Set up proper monorepo structure

### Phase 2: Visual Editor

1. Integrate React Flow
2. Build node palette and categories
3. Implement connection validation
4. Add property panels
5. Create Blueprint persistence

### Phase 3: Execution Engine

1. Implement sandboxed execution (vm2)
2. Build job queue system
3. Add progress tracking
4. Implement error handling
5. Create real-time monitoring

### Phase 4: Node Ecosystem

1. Build core node library
2. Create node plugin system
3. Add node marketplace
4. Implement version management
5. Enable hot-reloading

### Phase 5: Production Polish

1. Add Electron desktop app
2. Implement collaboration features
3. Add cloud storage options
4. Build community features
5. Performance optimization

---

**Last Updated**: September 1, 2025  
**Status**: Vision Document - See [TODO.md](/docs/TODO.md) for implementation tracking  
**Archive**: Previous detailed documentation moved to [/docs/architecture/archive/](/docs/architecture/archive/)
