---
title: "@atomiton/conductor"
description:
  "Central execution engine for atomic and composite nodes in the Atomiton"
stage: "alpha"
version: "0.1.0"
last_updated: "2025-09-28"
dependencies: []
tags: []
ai_context:
  category: "framework"
  complexity: "complex"
  primary_language: "typescript"
---

# @atomiton/conductor

Central execution engine for atomic and composite nodes in the Atomiton
platform.

## Overview

The conductor package owns all execution types and provides the core execution
engine that can execute any Node - whether atomic (single operation) or
composite (containing other nodes). It handles:

- Execution context management
- Topological sorting of composite nodes
- Error handling and propagation
- Execution status tracking
- Output passing between connected nodes

## Installation

```bash
pnpm add @atomiton/conductor
```

## Usage

### Basic Example

```typescript
import { createConductor } from "@atomiton/conductor";
import type { NodeDefinition } from "@atomiton/nodes";

// Create a conductor instance
const conductor = createConductor();

// Define a node to execute
const node: NodeDefinition = {
  id: "processor-1",
  type: "data-processor",
  version: "1.0.0",
  name: "My Processor",
  position: { x: 0, y: 0 },
  metadata: {},
  parameters: { threshold: 0.5 },
  inputPorts: [],
  outputPorts: [],
};

// Execute the node
const result = await conductor.execute(node, {
  input: { data: [1, 2, 3] },
  variables: { userId: "123" },
});

if (result.success) {
  console.log("Output:", result.data);
  console.log("Executed nodes:", result.executedNodes);
} else {
  console.error("Execution failed:", result.error);
}
```

### Composite Node Execution

```typescript
const compositeNode: NodeDefinition = {
  id: "flow-1",
  type: "flow",
  version: "1.0.0",
  name: "Data Pipeline",
  position: { x: 0, y: 0 },
  metadata: {},
  parameters: {},
  inputPorts: [],
  outputPorts: [],
  nodes: [
    // Child nodes with parentId references
    { id: "child-1", parentId: "flow-1", ... },
    { id: "child-2", parentId: "flow-1", ... },
  ],
  edges: [
    // Connections between nodes
    { source: "child-1", target: "child-2", sourceHandle: "out", targetHandle: "in" },
  ],
};

const result = await conductor.execute(compositeNode);
```

## API Reference

### `createConductor(config?: ConductorConfig)`

Creates a new conductor instance.

#### Parameters

- `config` (optional): Configuration options
  - `maxRetries`: Maximum retry attempts for failed nodes
  - `retryDelay`: Delay between retries in milliseconds
  - `timeout`: Maximum execution time in milliseconds
  - `logLevel`: Logging verbosity ("debug" | "info" | "warn" | "error")

#### Returns

A conductor instance with an `execute` method.

### `conductor.execute(node, context?)`

Executes a node (atomic or composite).

#### Parameters

- `node`: NodeDefinition to execute
- `context` (optional): Partial execution context
  - `executionId`: Unique execution identifier
  - `variables`: Execution variables
  - `input`: Input data for the node

#### Returns

Promise<ExecutionResult> with:

- `success`: Boolean indicating success/failure
- `data`: Output data (if successful)
- `error`: ExecutionError details (if failed)
- `duration`: Execution time in milliseconds
- `executedNodes`: Array of executed node IDs

### Type Exports

The package exports all execution types for use by other packages:

```typescript
import type {
  ExecutionContext,
  ExecutionStatus,
  ExecutionResult,
  ExecutionError,
  ConductorConfig,
} from "@atomiton/conductor";
```

### Utility Functions

- `isAtomic(node)`: Check if a node is atomic (no children)
- `isComposite(node)`: Check if a node is composite (has children)

## Architecture

The conductor uses a recursive execution model:

1. **Atomic Nodes**: Looks up the NodeExecutable from the registry and executes
   it directly
2. **Composite Nodes**:
   - Determines execution order using topological sorting
   - Executes child nodes in order
   - Passes outputs between connected nodes
   - Returns the final output

## Error Handling

The conductor provides comprehensive error handling:

- Execution failures are captured with context
- Error details include nodeId, timestamp, message, and stack trace
- Composite node failures include which nodes were successfully executed before
  failure

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```
