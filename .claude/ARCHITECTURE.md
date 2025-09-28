# Atomiton Architecture & Domain Model

## Core Architecture

### Foundation Concepts

1. **Everything is a Node** - The entire system is built on the `NodeDefinition`
   type
2. **Co-location is key** - Node definitions and implementations stay together
3. **Simple execution interface** - Just params in, result out
4. **Flow is a user concept** - "Flow" only exists in user-facing contexts (UI,
   file names)
5. **Conductor orchestrates** - Adds execution context and orchestration
6. **RPC is pure transport** - Just moves messages, no business logic
7. **Clean layering** - Each package has one clear responsibility

### Foundation Principle: Everything is a Node

The entire system is built on a single foundational type: `NodeDefinition`.
There is no separate "Flow" type - a flow is just a user-friendly term for a
saved NodeDefinition that typically has child nodes.

```typescript
// The universal type that everything is built on
interface NodeDefinition {
  id: string;
  type: string; // 'group', 'httpRequest', 'transform', etc.
  version?: string;
  parentId?: string; // Hierarchy
  name?: string;
  position?: { x: number; y: number };
  metadata?: NodeMetadata;
  parameters?: Record<string, any>;

  // Group nodes have these
  nodes?: NodeDefinition[]; // Child nodes (if present, it's a group)
  edges?: NodeEdge[]; // Connections between children
}
```

### Co-location Principle: Keep Node Parts Together

Each node type has all its parts in one place:

```typescript
// @atomiton/nodes/src/library/http-request/index.ts

// Definition and implementation co-located
export const httpRequestDefinition = {
  type: 'httpRequest',
  version: '1.0.0',
  inputPorts: [...],
  outputPorts: [...]
};

// Simple execution interface
export const httpRequestExecutable: NodeExecutable = {
  async execute(params) {
    const response = await fetch(params.url);
    return response.json();
  }
};

// Exported together
export const httpRequestNode = {
  definition: httpRequestDefinition,
  executable: httpRequestExecutable
};
```

---

## The Simplest Possible API

Our entire system boils down to two simple operations:

### 1. Creating Nodes

```typescript
import { createNodeDefinition } from "@atomiton/nodes";

const node = createNodeDefinition({
  type: "group",
  nodes: [
    { type: "httpRequest", parameters: { url: "api.example.com" } },
    { type: "transform", parameters: { script: "return data" } },
  ],
});
```

### 2. Executing Nodes

```typescript
import { execute } from "#lib/conductor";

const result = await execute(node);
```

That's it. The entire API is two functions: `createNodeDefinition()` and
`execute()`.

---

## Domain Ownership

### Package Structure

```
Foundation Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@atomiton/nodes
  Purpose: Node definitions + implementations (co-located)
  Owns: NodeDefinition, NodeExecutable, node registry
  Dependencies: NONE - this is the foundation

Orchestration Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@atomiton/conductor
  Purpose: Execution orchestration and context
  Owns: ExecutionContext, ExecutionResult, orchestration logic
  Dependencies: @atomiton/nodes only

Transport Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@atomiton/rpc
  Purpose: Pure message passing between processes
  Owns: RPCRequest, RPCResponse, IPC channels
  Dependencies: @atomiton/nodes, @atomiton/conductor (types only)

Storage Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@atomiton/storage
  Purpose: File persistence and serialization
  Owns: FlowFile format, save/load operations
  Dependencies: @atomiton/nodes only

Visualization Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@atomiton/editor
  Purpose: Visual editing and transformation
  Owns: nodeToReactFlow, reactFlowToNode, UI components
  Dependencies: @atomiton/nodes only
```

### Type Ownership Matrix

| Type/Function            | Owner               | Import From             | Description         |
| ------------------------ | ------------------- | ----------------------- | ------------------- |
| `NodeDefinition`         | @atomiton/nodes     | `'@atomiton/nodes'`     | Structure           |
| `NodeExecutable`         | @atomiton/nodes     | `'@atomiton/nodes'`     | Simple interface    |
| `createNodeDefinition()` | @atomiton/nodes     | `'@atomiton/nodes'`     | Factory             |
| `nodeRegistry`           | @atomiton/nodes     | `'@atomiton/nodes'`     | All implementations |
| `ExecutionContext`       | @atomiton/conductor | `'@atomiton/conductor'` | Rich context        |
| `ExecutionResult`        | @atomiton/conductor | `'@atomiton/conductor'` | Rich result         |
| `execute()`              | @atomiton/conductor | Via client wrapper      | Orchestration       |

---

## Execution Flow

### Simple Interface in Nodes

```typescript
// @atomiton/nodes - Simple interface
export interface NodeExecutable {
  execute(params: any): Promise<any>;
}

// Each node implements this simple interface
export const transformExecutable: NodeExecutable = {
  async execute(params) {
    // params in, result out - that's it
    return eval(params.script)(params.input);
  },
};
```

### Rich Orchestration in Conductor

```typescript
// @atomiton/conductor - Adds context and orchestration
class Conductor {
  async execute(
    node: NodeDefinition,
    context?: Partial<ExecutionContext>,
  ): Promise<ExecutionResult> {
    // Get simple implementation from nodes
    const nodeImpl = getNodeImplementation(node.type);

    if (node.nodes && node.nodes.length > 0) {
      // Orchestrate group execution
      return this.executeGroup(node, context);
    }

    // Call simple execute, add rich context
    const result = await nodeImpl.executable.execute(node.parameters);

    return {
      success: true,
      data: result,
      executionContext: context,
      duration: elapsed,
      executedNodes: [node.id],
    };
  }
}
```

---

## Co-location Example: HTTP Request Node

```typescript
// @atomiton/nodes/src/library/http-request/index.ts
// Everything about httpRequest in one place

import type { NodeExecutable } from "../../types/executable";

// 1. Definition - what it is
export const httpRequestDefinition = {
  type: "httpRequest",
  version: "1.0.0",
  category: "network",
  inputPorts: [
    { id: "url", type: "string", required: true },
    { id: "method", type: "string", default: "GET" },
    { id: "headers", type: "object" },
    { id: "body", type: "any" },
  ],
  outputPorts: [
    { id: "data", type: "any" },
    { id: "status", type: "number" },
    { id: "headers", type: "object" },
  ],
};

// 2. Implementation - what it does
export const httpRequestExecutable: NodeExecutable = {
  async execute(params) {
    const { url, method = "GET", headers = {}, body } = params;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return {
      data: await response.json(),
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  },
};

// 3. Documentation - how to use it
export const httpRequestDocs = {
  description: "Makes HTTP requests to external APIs",
  examples: [
    {
      name: "Simple GET",
      parameters: { url: "https://api.example.com/data" },
    },
    {
      name: "POST with body",
      parameters: {
        url: "https://api.example.com/users",
        method: "POST",
        body: { name: "John" },
      },
    },
  ],
};

// 4. Export everything together
export const httpRequestNode = {
  definition: httpRequestDefinition,
  executable: httpRequestExecutable,
  docs: httpRequestDocs,
};
```

This co-location means:

- ✅ Easy to understand - everything is in one file
- ✅ Easy to maintain - changes are localized
- ✅ Easy to test - test the whole node unit
- ✅ Easy to share - one export has everything

---

## Key Implementation Notes

### For Claude Code Agents

#### DO ✅

- Keep node definitions and implementations together
- Use simple NodeExecutable interface (params → result)
- Let Conductor add execution context
- Use existing utilities (createNodeDefinition)
- Keep the API simple (just execute(node))
- Check `node.nodes` directly for groups
- Execute migration steps IN ORDER

#### DON'T ❌

- Split node definitions from implementations
- Create complex execution interfaces in nodes
- Put ExecutionContext in nodes package
- Create unnecessary abstractions
- Move Flow package utilities
- Import RPC directly in client code
- Skip migration steps

### Import Guide

```typescript
// Node structure and implementations
import {
  NodeDefinition,
  NodeExecutable,
  createNodeDefinition,
} from "@atomiton/nodes";
import { getNodeImplementation } from "@atomiton/nodes/registry";

// Execution orchestration (only in Conductor)
import { ExecutionContext, ExecutionResult } from "@atomiton/conductor";

// Client-side execution
import { execute } from "#lib/conductor";

// Storage operations
import { saveFlowFile, loadFlowFile } from "@atomiton/storage";

// Editor transformations
import { nodeToReactFlow, reactFlowToNode } from "@atomiton/editor";
```

---

## Architecture Benefits

### Co-location Benefits

1. **Domain Cohesion** - All aspects of a node type are together
2. **Easier Navigation** - Find everything in one place
3. **Better Encapsulation** - Node types are self-contained units
4. **Simpler Testing** - Test the whole node as a unit
5. **Easier Sharing** - Export/import complete nodes

### Simple Interface Benefits

1. **No Circular Dependencies** - Nodes doesn't need Conductor types
2. **Clear Separation** - Nodes: what/how, Conductor: when/orchestration
3. **Testable in Isolation** - Test node execution without Conductor
4. **Flexible Enhancement** - Conductor can add any context needed
5. **Easy to Understand** - Just params in, result out

---

## Summary

The architecture maintains co-location while keeping clean boundaries:

1. **@atomiton/nodes** - Co-located definitions + implementations with simple
   interface
2. **@atomiton/conductor** - Imports simple types, adds orchestration and
   context
3. **Simple API** - `createNodeDefinition()` and `execute()`
4. **No abstractions** - Just check `node.nodes` for groups
5. **No Flow package** - Flow is just what users call saved nodes

This creates a system that is:

- **Cohesive** - Node parts stay together
- **Simple** - Minimal interfaces
- **Flexible** - Conductor can enhance as needed
- **Maintainable** - Clear boundaries
- **Understandable** - Co-location makes code easier to follow
