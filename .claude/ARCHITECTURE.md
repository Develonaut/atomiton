# Atomiton Architecture & Domain Model

## Core Architecture

### Foundation Concepts

1. **Everything is a Node** - The entire system is built on the `NodeDefinition` type
2. **Flow is a user concept** - "Flow" only exists in user-facing contexts (UI, file names)
3. **Conductor owns execution** - Single source of truth for all execution logic
4. **RPC is pure transport** - Just moves messages, no business logic
5. **Clean layering** - Each package has one clear responsibility
6. **No unnecessary abstractions** - Just check `node.nodes` array to see if it's a group
7. **Use existing utilities** - We already have what we need

### Foundation Principle: Everything is a Node

The entire system is built on a single foundational type: `NodeDefinition`. There is no separate "Flow" type - a flow is just a user-friendly term for a saved NodeDefinition that typically has child nodes.

```typescript
// The universal type that everything is built on
interface NodeDefinition {
  id: string;
  type: string;  // 'group', 'httpRequest', 'transform', etc.
  version?: string;
  parentId?: string;           // Hierarchy
  name?: string;
  position?: { x: number; y: number };
  metadata?: NodeMetadata;
  parameters?: Record<string, any>;
  
  // Group nodes have these
  nodes?: NodeDefinition[];    // Child nodes (if present, it's a group)
  edges?: NodeEdge[];          // Connections between children
}
```

**Key Insights**: 
- A "Flow" is just a NodeDefinition with child nodes
- Check `node.nodes` to see if it's a group - no special abstractions needed
- Nodes with `type: 'group'` typically have child nodes

---

## The Simplest Possible API

Our entire system boils down to two simple operations:

### 1. Creating Nodes
```typescript
import { createNodeDefinition } from '@atomiton/nodes';

const node = createNodeDefinition({
  type: 'group',
  nodes: [
    { type: 'httpRequest', parameters: { url: 'api.example.com' } },
    { type: 'transform', parameters: { script: 'return data' } }
  ]
});
```

### 2. Executing Nodes
```typescript
import { execute } from '#lib/conductor';

const result = await execute(node);
```

That's it. The entire API is two functions: `createNodeDefinition()` and `execute()`.

---

## Domain Ownership

### Package Structure

```
Foundation Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@atomiton/nodes
  Purpose: Pure structural types (zero behavior)
  Owns: NodeDefinition, createNodeDefinition utility
  Dependencies: NONE - this is the foundation
  
Execution Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@atomiton/conductor
  Purpose: All execution logic and types
  Owns: ExecutionContext, ExecutionResult, execute() method
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

| Type/Function | Owner | Import From |
|--------------|-------|-------------|
| `NodeDefinition` | @atomiton/nodes | `'@atomiton/nodes'` |
| `createNodeDefinition()` | @atomiton/nodes | `'@atomiton/nodes'` |
| `ExecutionContext` | @atomiton/conductor | `'@atomiton/conductor'` |
| `ExecutionResult` | @atomiton/conductor | `'@atomiton/conductor'` |
| `execute()` | @atomiton/conductor | Via client wrapper |
| `RPCRequest` | @atomiton/rpc | `'@atomiton/rpc'` |
| `FlowFile` | @atomiton/storage | `'@atomiton/storage'` |

---

## Execution Flow

### The Conductor's Job

The Conductor provides a simple `execute()` method:

```typescript
// @atomiton/conductor
class Conductor {
  async execute(node: NodeDefinition, context?: Partial<ExecutionContext>): Promise<ExecutionResult> {
    // Simple check - does it have child nodes?
    if (node.nodes && node.nodes.length > 0) {
      // It's a group - execute children in order
      return this.executeGroup(node, context);
    }
    // Single node - execute the operation
    return this.executeSingleNode(node, context);
  }
}
```

### Client Usage

```typescript
// /apps/client/src/lib/conductor/index.ts
import { createConductor } from '@atomiton/conductor';

const conductor = createConductor({
  transport: window.electron ? createRPCTransport() : undefined
});

// Export the simple API
export const execute = (node: NodeDefinition) => conductor.execute(node);
```

---

## Node Lifecycle

### 1. Creation
```typescript
import { createNodeDefinition } from '@atomiton/nodes';

const node = createNodeDefinition({
  type: 'group',
  name: 'My Automation',
  nodes: [...child nodes...],
  edges: [...connections...]
});
```

### 2. Execution
```typescript
import { execute } from '#lib/conductor';

const result = await execute(node);
// That's it!
```

### 3. Storage
```typescript
import { saveFlowFile } from '@atomiton/storage';

await saveFlowFile(node, { name: 'My Automation' });
// Saves as .flow.yaml
```

### 4. Loading
```typescript
import { loadFlowFile } from '@atomiton/storage';

const node = await loadFlowFile('my-automation.flow.yaml');
// Returns NodeDefinition ready to execute
```

---

## File Format & Storage

### Flow File Structure (.flow.yaml)

```yaml
# File format version
version: "1.0"

# User-facing metadata
metadata:
  name: "Daily Data Sync"
  description: "Syncs data from API to database"
  createdAt: "2024-01-01T00:00:00Z"
  updatedAt: "2024-01-15T12:00:00Z"

# The actual node tree
root:
  id: "node-abc123"
  type: "group"  # Group nodes have children
  name: "Daily Data Sync"
  nodes:
    - id: "http-1"
      type: "httpRequest"
      parameters:
        url: "https://api.example.com/data"
        method: "GET"
    
    - id: "transform-1"
      type: "transform"
      parameters:
        script: "return data.items"
  
  edges:
    - id: "edge-1"
      source: "http-1"
      target: "transform-1"
```

---

## What We DON'T Have (By Design)

Following the YAGNI principle, we intentionally don't have:

- ❌ isAtomic/isComposite abstractions
- ❌ Complex validation utilities
- ❌ Flow-specific type guards
- ❌ Transformation helpers
- ❌ Complex factory functions

**Why?** Because we don't need them yet. When we do, we'll build exactly what we need.

### How We Check for Groups

Instead of abstractions, we just check directly:

```typescript
// Is it a group node?
if (node.nodes && node.nodes.length > 0) {
  // It has children, execute them
}

// Or check the type
if (node.type === 'group') {
  // It's explicitly a group
}
```

Simple. Direct. No abstractions.

---

## Import Guide

### Essential Imports Only

```typescript
// Creating nodes
import { NodeDefinition, createNodeDefinition } from '@atomiton/nodes';

// Executing nodes
import { execute } from '#lib/conductor';

// Execution types (if needed)
import { ExecutionResult } from '@atomiton/conductor';

// Storage operations
import { saveFlowFile, loadFlowFile } from '@atomiton/storage';

// Editor transformations
import { nodeToReactFlow, reactFlowToNode } from '@atomiton/editor';
```

### Complete Example

```typescript
import { createNodeDefinition } from '@atomiton/nodes';
import { execute } from '#lib/conductor';
import { saveFlowFile } from '@atomiton/storage';

// Create
const node = createNodeDefinition({
  type: 'group',
  nodes: [
    { type: 'httpRequest', parameters: { url: 'api.example.com' } }
  ]
});

// Execute
const result = await execute(node);

// Save
if (result.success) {
  await saveFlowFile(node, { name: 'My API Call' });
}
```

---

## Key Implementation Notes

### For Claude Code Agents

#### DO ✅
- Use existing utilities (createNodeDefinition)
- Keep the API simple (just execute(node))
- Check `node.nodes` directly for groups
- Execute migration steps IN ORDER
- Keep @atomiton/nodes pure (no execution)
- Put ALL execution types in @atomiton/conductor
- Make RPC dumb transport only

#### DON'T ❌
- Create new utilities unless needed
- Add abstractions (isAtomic/isComposite)
- Move Flow package utilities
- Complicate the execute API
- Add execution types to @atomiton/nodes
- Import RPC directly in client code
- Skip migration steps

### Validation Commands

```bash
# Check no flow package
pnpm why @atomiton/flow  # Should fail

# Check circular dependencies
pnpm dlx madge --circular packages/  # Should show none

# Type check
pnpm tsc --noEmit  # Should pass

# Build
pnpm build  # Should succeed

# Test
pnpm test  # All should pass

# Run app
pnpm dev  # Should work in browser and Electron
```

---

## Summary

The architecture is beautifully simple:

1. **One type**: `NodeDefinition` - everything is a node
2. **One factory**: `createNodeDefinition()` - already exists in nodes package
3. **One execution method**: `execute(node)` - from conductor
4. **No abstractions**: Just check `node.nodes` for groups
5. **No unnecessary code**: YAGNI principle throughout

This creates a system that is:
- **Minimal** - Only what we need, nothing more
- **Simple** - Two-function API
- **Clear** - No confusing abstractions
- **Maintainable** - Less code = fewer bugs
- **Extensible** - Easy to add what we need when we need it
