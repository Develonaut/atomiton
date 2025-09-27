# Type Hierarchy Clarification

## The Confusion

Currently we have:

- `NodeDefinition` in @atomiton/nodes - Defines what a node TYPE is (like a
  class)
- `FlowNode` in @atomiton/flow - An INSTANCE of a node in a flow (like an
  object)

These are completely different concepts that shouldn't share inheritance!

## Correct Type Structure

### @atomiton/nodes Package

```typescript
// This defines what a node TYPE is (like a class definition)
interface NodeDefinition {
  type: string; // 'httpRequest', 'transform', etc.
  version: string; // '2.0.1'
  category: string; // 'network', 'data', etc.

  // Schema for configuration
  configSchema: ZodSchema;

  // Input/output ports
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];

  // Metadata about the node type
  metadata: {
    label: string;
    description: string;
    icon?: string;
    deprecated?: boolean;
  };

  // The actual executable
  execute: (context: ExecutionContext, config: any) => Promise<ExecutionResult>;
}
```

### @atomiton/flow Package

```typescript
// Base executable interface
interface Executable {
  id: string;
  type: string;
}

// A node INSTANCE in a flow (references a NodeDefinition by type)
interface FlowNode extends Executable {
  type: string; // References NodeDefinition.type
  nodeVersion?: string; // Which version of the NodeDefinition

  // Instance-specific data
  position: { x: number; y: number };
  config: Record<string, any>; // Actual configuration values
  label?: string; // Instance label (override)
}

// A flow is a composite executable
interface Flow extends Executable {
  type: "flow"; // Always 'flow'
  version: number; // Schema version

  name: string;
  description?: string;

  // Contains node INSTANCES
  nodes: FlowNode[];
  connections: Connection[];

  metadata: FlowMetadata;
}
```

## The Key Insight

```typescript
// NodeDefinition is like a CLASS
class HttpRequestNodeDefinition {
  static type = 'httpRequest';
  static version = '2.0.1';
  static execute() { ... }
}

// FlowNode is like an INSTANCE
const myHttpNode = {
  id: 'node-1',
  type: 'httpRequest',      // References the definition
  nodeVersion: '2.0.1',     // Which version to use
  config: {                 // Instance configuration
    url: 'https://api.com',
    method: 'GET'
  },
  position: { x: 100, y: 200 }
};
```

## What This Means

1. **FlowNode doesn't extend NodeDefinition** - They're completely different
   things
2. **FlowNode references NodeDefinition by type** - Like an object references
   its class
3. **FlowNode has instance data** - position, config values, instance ID
4. **NodeDefinition has type data** - schema, execution logic, metadata

## Simplified Type Hierarchy

```
@atomiton/nodes
└── NodeDefinition (what a node type IS)
    ├── type: string
    ├── version: string
    ├── configSchema: Schema
    └── execute: Function

@atomiton/flow
└── Executable (base for anything that can run)
    ├── FlowNode (instance of a node in a flow)
    │   ├── References NodeDefinition by type
    │   ├── Has instance config
    │   └── Has position in flow
    └── Flow (composite of nodes)
        ├── Contains FlowNode[]
        └── Contains Connection[]
```

## Updated Flow Package Types

```typescript
// @atomiton/flow/src/types/Flow.ts

// Base executable - very simple
export interface Executable {
  id: string;
  type: string;
}

// Node instance in a flow
export interface FlowNode extends Executable {
  // Reference to NodeDefinition
  type: string; // 'httpRequest', 'transform', etc.
  nodeVersion?: string; // '2.0.1' - which version of the definition

  // Instance data
  position: { x: number; y: number };
  config: Record<string, any>;
  label?: string;

  // For hierarchy (if needed)
  parentId?: string;
}

// Flow is a composite executable
export interface Flow extends Executable {
  type: "flow";
  version: number; // Schema version for migrations

  name: string;
  description?: string;
  nodes: FlowNode[];
  connections: Connection[];
  metadata?: FlowMetadata;
}

// Connection between nodes
export interface Connection {
  id: string;
  source: string; // node id
  sourceHandle?: string;
  target: string; // node id
  targetHandle?: string;
}

// Type guards
export const isFlow = (exe: Executable): exe is Flow => exe.type === "flow";

export const isNode = (exe: Executable): exe is FlowNode => !isFlow(exe);

// Factories
export const createFlowNode = (params: {
  type: string;
  config?: Record<string, any>;
  position?: { x: number; y: number };
}): FlowNode => ({
  id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: params.type,
  config: params.config || {},
  position: params.position || { x: 0, y: 0 },
});

export const createFlow = (params: {
  name: string;
  nodes?: FlowNode[];
  connections?: Connection[];
}): Flow => ({
  id: `flow-${Date.now()}`,
  type: "flow",
  version: 1,
  name: params.name,
  nodes: params.nodes || [],
  connections: params.connections || [],
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});
```

## How They Work Together

```typescript
// At design time - user picks from available NodeDefinitions
const availableNodes: NodeDefinition[] = getNodeDefinitions();
// Shows: HTTP Request v2.0.1, Transform v1.5.0, etc.

// User drags HTTP Request onto canvas - create FlowNode instance
const newNode: FlowNode = createFlowNode({
  type: "httpRequest", // References NodeDefinition.type
  position: { x: 100, y: 100 },
});

// At runtime - conductor looks up NodeDefinition to execute
const definition = getNodeDefinition(flowNode.type, flowNode.nodeVersion);
const result = await definition.execute(context, flowNode.config);
```

## Summary

- **NodeDefinition** = The blueprint (what a node type can do)
- **FlowNode** = An instance (a specific usage of that type)
- They don't share inheritance, FlowNode just references NodeDefinition by type
- This is like the difference between a class and an object instance

Does this make more sense? FlowNode shouldn't extend or inherit from
NodeDefinition - they're completely different concepts!
