# Atomiton Nodes Architecture Strategy: Including Conductor Package

## Current Architecture Analysis

After reviewing your codebase, here's how your system currently works:

### Package Relationships

```
apps/client (Browser)
    ↓ imports metadata
@atomiton/nodes (Mixed Node.js + Browser code)
    ↑ imports for execution
@atomiton/conductor (Execution orchestrator)
    - Has browser export
    - Uses transport layer (IPC, HTTP, Local)
    - Executes nodes in different environments
```

### Key Insights

1. **Conductor Already Handles Platform Separation**: Your conductor package already has a transport abstraction layer that routes execution based on environment (IPC for Electron, HTTP for browser, Local for Node.js)

2. **Conductor Imports from Nodes**: The conductor imports types and execution interfaces from `@atomiton/nodes`:
   - `NodeExecutionContext`
   - `NodeExecutionResult`
   - `INode`
   - `CompositeDefinition`

3. **Browser Safety**: Conductor has a `/browser` export path, showing it's already designed for cross-platform usage

## How n8n Handles This (For Comparison)

n8n's architecture:

- **n8n-workflow**: Types, interfaces, models (browser-safe, no Node.js deps)
- **n8n-nodes-base**: Concrete node implementations (server-only)
- **n8n-core**: Execution engine (similar to your conductor)
- **n8n-editor-ui**: Browser UI

Key difference: n8n keeps execution strictly server-side, using WebSocket/HTTP for browser communication.

## Recommended Architecture for Atomiton

Given your existing conductor package, here's the optimal approach:

### Package Structure

```
@atomiton/workflow/              # Browser-safe (like n8n-workflow)
├── types/                       # All shared types
├── interfaces/                  # INode, INodeLogic, etc.
├── metadata/                    # Node metadata definitions
├── parameters/                  # Node parameter schemas
├── ports/                       # Port definitions
└── schemas/                     # Zod schemas for validation

@atomiton/nodes/                 # Execution logic (like n8n-nodes-base)
├── nodes/                       # Only logic.ts files
│   ├── file-system/
│   │   └── logic.ts            # Node.js execution
│   └── [other-nodes]/
└── composite/                   # Composite execution

@atomiton/conductor/             # Orchestrator (stays as-is mostly)
├── transport/                   # Already handles platform routing
├── execution/                   # Node execution
└── browser.ts                   # Browser-safe exports
```

### Import Flow

```typescript
// Browser (apps/client)
import { NodeDefinition, NodeMetadata } from "@atomiton/workflow";
// Never imports @atomiton/nodes directly

// Conductor (execution layer)
import { INode, NodeExecutionContext } from "@atomiton/workflow"; // types
import { FileSystemLogic } from "@atomiton/nodes"; // execution only in Node.js

// Desktop (Electron main)
import { conductor } from "@atomiton/conductor";
import { nodes } from "@atomiton/nodes"; // Full access
```

### Why This Works Better With Conductor

1. **Conductor Already Routes**: Your transport layer already handles browser vs Node.js execution
2. **Clean Separation**: Browser never loads Node.js code
3. **Type Safety**: Shared types in workflow package prevent drift
4. **No Duplication**: Conductor continues to be the execution orchestrator

## Implementation Strategy

### Phase 1: Create @atomiton/workflow Package

**What goes in workflow:**

- All type definitions currently in nodes/src/types.ts
- All interfaces from nodes/src/base/
- Metadata, parameters, ports from each node (NOT logic.ts)
- Zero Node.js dependencies

**package.json:**

```json
{
  "name": "@atomiton/workflow",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "dependencies": {
    "zod": "^3.25.3"
  }
}
```

### Phase 2: Update @atomiton/nodes Package

**What stays in nodes:**

- Only execution logic (logic.ts files)
- Composite execution
- Node.js dependencies (fs, child_process, etc.)

**Updated imports:**

```typescript
// nodes/src/nodes/file-system/logic.ts
import { INodeLogic, NodeExecutionContext } from "@atomiton/workflow";
import { readFile } from "fs/promises"; // Node.js only
```

### Phase 3: Update Conductor Package

**Minimal changes needed:**

```typescript
// conductor/src/execution/nodeExecutor.ts
import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/workflow"; // Changed from @atomiton/nodes

// Only import execution when in Node.js environment
if (typeof process !== "undefined") {
  const { nodes } = await import("@atomiton/nodes");
  // Use nodes for execution
}
```

### Phase 4: Update Browser Imports

```typescript
// apps/client/src/components/Editor/nodes.ts
import { NodeDefinition, getNodeMetadata } from "@atomiton/workflow";
// No longer imports @atomiton/nodes
```

## Benefits Over Previous Strategies

1. **Works with Conductor**: Leverages existing transport abstraction
2. **n8n Proven Pattern**: Follows industry standard
3. **Minimal Conductor Changes**: Transport layer stays the same
4. **Clear Boundaries**:
   - workflow = types/metadata (browser-safe)
   - nodes = execution (Node.js only)
   - conductor = orchestration (cross-platform)

## Migration Path

### Week 1

1. Create @atomiton/workflow package
2. Move types, interfaces, metadata
3. Update imports in conductor
4. Test execution flow

### Week 2

1. Update apps/client imports
2. Clean up @atomiton/nodes
3. Full integration testing
4. Documentation

## Key Decisions

### Q: Why not just use platform detection (Voorhees approach)?

**A**: With conductor in the mix, clean separation is better. Conductor already handles platform routing, so keeping Node.js code completely out of browser bundles is optimal.

### Q: How does conductor execute nodes in browser?

**A**: It doesn't - it uses HTTP/WebSocket transport to execute on server. The browser only needs metadata for UI display.

### Q: What about type drift between packages?

**A**: Single source of truth in @atomiton/workflow. Both nodes and conductor import from there.

## Implementation Prompt for Claude Code

```
Implement n8n-inspired package separation for Atomiton, accounting for the conductor package:

CONTEXT:
- Conductor package handles execution orchestration
- Conductor has transport layer for browser/Node.js routing
- Need to separate node metadata from execution logic

REQUIREMENTS:
1. Create @atomiton/workflow package with browser-safe types and metadata
2. Keep execution logic in @atomiton/nodes (Node.js only)
3. Update conductor to import types from workflow
4. Ensure browser never loads Node.js dependencies

TASKS:

1. Create @atomiton/workflow package:
   - Move all types from nodes/src/types.ts
   - Move all interfaces from nodes/src/base/
   - Move metadata, parameters, ports from each node
   - NO logic.ts files
   - NO Node.js dependencies

2. Update @atomiton/nodes:
   - Keep only logic.ts files
   - Import types from @atomiton/workflow
   - Keep Node.js dependencies here

3. Update @atomiton/conductor:
   - Change imports from @atomiton/nodes to @atomiton/workflow for types
   - Keep execution imports from @atomiton/nodes (Node.js only)
   - Browser export should only use workflow types

4. Update apps/client:
   - Import from @atomiton/workflow instead of @atomiton/nodes
   - Remove any direct node execution attempts

STRUCTURE:
@atomiton/workflow/
├── src/
│   ├── types/        # From nodes/src/types.ts
│   ├── base/         # From nodes/src/base/ (no logic)
│   ├── metadata/     # Node metadata definitions
│   └── index.ts      # Clean exports (no barrels except public API)

@atomiton/nodes/
├── src/
│   ├── nodes/        # Only logic.ts files remain
│   └── index.ts      # Execution exports

Conductor's transport layer continues to handle browser vs Node.js execution routing.
```

## Conclusion

This architecture:

- **Follows n8n's proven pattern**
- **Works perfectly with your conductor package**
- **Provides clean separation without over-engineering**
- **Enables browser safety while maintaining full Node.js capabilities**
- **Requires minimal changes to conductor**

The conductor package becomes the bridge between browser-safe workflow definitions and Node.js execution, which is exactly its intended purpose.
