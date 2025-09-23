# @atomiton/nodes Architecture

## Mental Model: "Everything is a Node"

This package implements a unified node architecture where all executable units
share the same interface. Nodes can contain other nodes (forming groups),
connect to each other via edges, and execute business logic.

## Core Architecture

```
  NodeDefinition (Data Structure)
        │
        ├── id, name
        ├── position
        ├── metadata
        ├── parameters
        ├── ports (input/output) // Connection points
        ├── edges[]         // Connections to other nodes
        └── children[]      // Optional child nodes
        │
        ▼
  NodeExecutable (Runtime Instance)
    execute()
```

## Type System

### NodeDefinition

The fundamental data structure that represents any node:

```typescript
type NodeDefinition = {
  // Identification
  readonly id: string;
  readonly name: string;

  // Visual positioning
  position: NodePosition;

  // Node information
  metadata: NodeMetadata;

  // Configuration
  parameters: NodeParameters;

  // Connection points
  inputPorts: NodePort[];
  outputPorts: NodePort[];

  // Relationships
  edges?: NodeEdge[]; // Connections to other nodes
  children?: NodeDefinition[]; // Nested nodes (for groups)
};
```

### NodeMetadata

Describes what kind of node this is:

```typescript
type NodeMetadata = {
  type: string; // 'http-request', 'csv-reader', etc.
  version: string;
  author: string;
  description: string;
  category: string; // 'io', 'data', 'logic', etc.
  icon: string;
  tags?: string[];
  keywords?: string[];
};
```

### NodeExecutable

The runtime implementation that executes a node's business logic:

```typescript
type NodeExecutable<TConfig = unknown> = {
  execute: (
    context: NodeExecutionContext,
    config: TConfig,
  ) => Promise<NodeExecutionResult>;

  getValidatedParams: (context: NodeExecutionContext) => TConfig;
};
```

## Folder Structure

```
src/
├── core/                    # Shared types and utilities
│   ├── types/              # Type definitions
│   ├── factories/          # Factory functions
│   └── utils/              # Helper utilities
│
├── definitions/            # Browser-safe node configurations
│   ├── http-request/      # Each node type has its folder
│   ├── csv-reader/
│   ├── registry.ts        # Central registry
│   └── index.ts
│
├── executables/           # Runtime implementations (Node.js)
│   ├── http-request/
│   ├── csv-reader/
│   ├── registry.ts
│   └── index.ts
│
├── schemas/               # Validation schemas (Zod)
│   └── [node-name].ts
│
├── templates/             # Pre-built workflows
│   ├── yaml/             # Template definitions
│   ├── registry.ts
│   └── loader.ts
│
└── serialization/         # YAML conversion
    ├── fromYaml.ts
    └── toYaml.ts
```

## Key Concepts

### Groups

A group is simply a node that contains other nodes. Groups enable:

- **Composition** - Build complex workflows from simple nodes
- **Reusability** - Save and share node combinations
- **Abstraction** - Hide complexity behind a simple interface

```typescript
// A group is just a node with children
const groupNode: NodeDefinition = {
  id: "data-pipeline",
  name: "Data Processing Pipeline",
  children: [csvReaderNode, transformNode, fileWriterNode],
  edges: [
    { source: "csv-reader", target: "transform" },
    { source: "transform", target: "file-writer" },
  ],
};
```

### Edges

Edges connect nodes together, defining data flow:

```typescript
type NodeEdge = {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  sourceHandle?: string; // Output port ID
  targetHandle?: string; // Input port ID
};
```

### Ports

Ports define a node's interface - where data enters and exits:

```typescript
type NodePort = {
  id: string;
  name: string;
  type: "input" | "output" | "trigger" | "error";
  dataType: string;
  required?: boolean;
};
```

## Execution Model

1. **Context** - Each execution receives a context with inputs, parameters, and
   utilities
2. **Validation** - Parameters are validated against schemas
3. **Execution** - Business logic runs with full access to Node.js (desktop) or
   browser APIs
4. **Results** - Output data flows to connected nodes

```typescript
// Simplified execution flow
const context = {
  nodeId: "http-request-1",
  inputs: { url: "https://api.example.com" },
  parameters: { method: "GET" },
};

const result = await executable.execute(context);
// { success: true, outputs: { response: {...} } }
```

## Environment Separation

### Browser Bundle

- Contains only definitions
- No Node.js dependencies
- Used for UI, editing, visualization
- Lightweight and safe

### Desktop/Server Bundle

- Contains executables + definitions
- Full Node.js runtime access
- Handles actual execution
- File system, network, shell access

## Factory Pattern

Nodes are created using factory functions, not classes:

```typescript
// Create a node definition
const myNode = createNodeDefinition({
  id: "my-node",
  name: "My Node",
  metadata: createNodeMetadata({
    type: "my-node",
    category: "custom",
    // ...
  }),
  parameters: createNodeParameters({
    schema: mySchema,
    defaults: {
      /* ... */
    },
    fields: {
      /* ... */
    },
  }),
  inputPorts: [createNodePort({ id: "input", type: "input", dataType: "any" })],
  outputPorts: [
    createNodePort({ id: "output", type: "output", dataType: "any" }),
  ],
});
```

## Registry Pattern

Nodes are registered and retrieved from centralized registries:

```typescript
// Definition registry (browser-safe)
import {
  getNodeDefinition,
  getAllNodeDefinitions,
} from "@atomiton/nodes/definitions";

const httpNode = getNodeDefinition("http-request");
const allNodes = getAllNodeDefinitions();

// Executable registry (Node.js only)
import { getNodeExecutable } from "@atomiton/nodes/executables";

const executable = getNodeExecutable("http-request");
```

## Templates

Templates are pre-configured node groups saved as YAML:

```yaml
id: data-transform-pipeline
name: Data Transform Pipeline
nodes:
  - id: reader
    type: csv-reader
    parameters:
      filePath: /data/input.csv
  - id: transform
    type: transform
    parameters:
      expression: data.filter(row => row.active)
edges:
  - source: reader
    target: transform
```

Templates provide starting points for common workflows and can be customized
after loading.

## Helper Functions

Utility functions for working with nodes:

```typescript
// Check if a node has children
const hasChildren = (node: NodeDefinition): boolean =>
  Boolean(node.children && node.children.length > 0);

// Get the node type
const getNodeType = (node: NodeDefinition): string => node.metadata.type;

// Find all nodes of a specific type
const findNodesByType = (nodes: NodeDefinition[], type: string) =>
  nodes.filter((node) => node.metadata.type === type);
```

## Design Principles

1. **Simplicity** - One node interface for everything
2. **Composability** - Nodes combine to create complex behaviors
3. **Type Safety** - Full TypeScript support throughout
4. **Separation of Concerns** - Clear boundaries between data and execution
5. **Flexibility** - Nodes can represent anything from simple functions to
   complex workflows
