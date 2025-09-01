# Data Models & TypeScript Interfaces

Core data structures and TypeScript interfaces for the Atomiton platform.

## Overview

This document defines the primary data models used throughout the Atomiton platform. For implementation details, see the TypeScript definitions in the source code.

## Core Models

### Blueprint Models

Core blueprint and workflow data structures:

- **Blueprint**: Main workflow definition
- **Node**: Individual processing units
- **Connection**: Links between nodes
- **Port**: Input/output endpoints

### State Models

Application state management structures:

- **UIState**: User interface state and preferences
- **ExecutionState**: Runtime workflow execution state
- **SessionState**: User session and authentication data

### Node System Models

Node-specific data structures:

- **NodeDefinition**: Node type definitions and metadata
- **NodeInstance**: Runtime node instances
- **NodeConfig**: Node configuration and parameters
- **NodeRegistry**: Node type registration system

## Implementation

For detailed TypeScript interfaces and implementations, see:

- **Core Models**: `packages/core/src/types/`
- **Node Models**: `packages/nodes/src/types/`
- **UI Models**: `packages/ui/src/types/`

## Related Documentation

- **[System Architecture](./SYSTEM.md)** - Overall system design
- **[Blueprint Guide](./BLUEPRINT_GUIDE.md)** - Blueprint system details
- **[Node System](./NODE_SYSTEM.md)** - Node architecture
- **[Store Layer Guide](../../packages/core/docs/STORE_LAYER_GUIDE.md)** - State management

---

**Last Updated**: 2025-08-31  
**Maintained by**: Michael + Karen
