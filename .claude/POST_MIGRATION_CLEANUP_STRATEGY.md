# Post Migration Cleanup Strategy

## Overview

This document provides a step-by-step strategy to implement our architectural decisions. These steps **MUST** be executed in order as each builds on the previous one.

**CRITICAL**: The order matters! Later steps depend on earlier ones being complete.

## Architectural Decisions Recap

1. **Nodes is the foundation** - Pure structure, no execution
2. **Flow package will be removed** - Flow is just a user concept  
3. **Conductor owns all execution** - Single source of truth
4. **RPC is pure transport** - No business logic
5. **Client uses Conductor** - RPC is an implementation detail
6. **No abstractions** - Just check `node.nodes` array to see if it's a group
7. **Use existing utilities** - We already have `createNodeDefinition`

---

## Step 1: Clean and Establish Nodes Package as Foundation

**Goal**: Ensure @atomiton/nodes is purely structural with no execution logic.

### Claude Code Prompt:

```
Clean the @atomiton/nodes package to be the pure foundation with zero execution concerns.

1. AUDIT /packages/@atomiton/nodes/src for any execution types:
   - Remove any ExecutionContext, ExecutionResult, ExecutionError types
   - Remove any execution-related imports
   - Keep ONLY structural types

2. ENSURE core types are properly defined:
   ```typescript
   // /packages/@atomiton/nodes/src/types/index.ts
   export interface NodeDefinition {
     id: string;
     type: string;  // 'group', 'httpRequest', 'transform', etc.
     version?: string;
     parentId?: string;  // For hierarchy
     name?: string;
     position?: { x: number; y: number };
     metadata?: NodeMetadata;
     parameters?: Record<string, any>;
     inputPorts?: NodePort[];
     outputPorts?: NodePort[];
     nodes?: NodeDefinition[];  // If present, it's a group node
     edges?: NodeEdge[];         // Connections between children
   }
   
   export interface NodePort {
     id: string;
     label?: string;
     type: string;
     required?: boolean;
   }
   
   export interface NodeEdge {
     id: string;
     source: string;
     target: string;
     sourceHandle?: string;
     targetHandle?: string;
   }
   ```

3. VERIFY existing utilities are present:
   ```typescript
   // Should already exist:
   export function createNodeDefinition(params: Partial<NodeDefinition>): NodeDefinition
   
   // Add only if missing (but probably already exists):
   export const hasChildren = (node: NodeDefinition): boolean => {
     return Boolean(node.nodes && node.nodes.length > 0);
   };
   ```

4. VERIFY no dependencies on other @atomiton packages:
   - Check package.json has NO @atomiton/* dependencies
   - This is the foundation - everything else depends on it

5. DO NOT add new utilities - use what already exists

After this step, run: pnpm build -F @atomiton/nodes
```

---

## Step 2: Consolidate All Execution Types in Conductor

**Goal**: Move ALL execution types to @atomiton/conductor and implement simple execution API.

### Claude Code Prompt:

```
Consolidate all execution types in @atomiton/conductor with a simple execute API.

1. CREATE all execution types in Conductor:
   ```typescript
   // /packages/@atomiton/conductor/src/types/execution.ts
   export interface ExecutionContext {
     nodeId: string;  // NOT flowId - we execute nodes
     executionId: string;
     variables: Record<string, any>;
     input?: any;
     parentContext?: ExecutionContext;
   }
   
   export interface ExecutionResult<T = any> {
     success: boolean;
     data?: T;
     error?: ExecutionError;
     duration?: number;
     executedNodes?: string[];
   }
   
   export interface ExecutionError {
     nodeId: string;
     message: string;
     code?: string;
     timestamp: Date;
   }
   
   export enum ExecutionStatus {
     PENDING = 'pending',
     RUNNING = 'running',
     COMPLETED = 'completed',
     FAILED = 'failed',
     CANCELLED = 'cancelled'
   }
   ```

2. CREATE transport abstraction:
   ```typescript
   // /packages/@atomiton/conductor/src/types/transport.ts
   export interface ConductorTransport {
     execute(node: NodeDefinition, context: ExecutionContext): Promise<ExecutionResult>;
   }
   ```

3. IMPLEMENT simple Conductor with execute method:
   ```typescript
   // /packages/@atomiton/conductor/src/conductor.ts
   import { NodeDefinition } from '@atomiton/nodes';
   
   export class Conductor {
     constructor(private config: { transport?: ConductorTransport } = {}) {}
     
     // Simple API - just execute a node
     async execute(node: NodeDefinition, context?: Partial<ExecutionContext>): Promise<ExecutionResult> {
       const ctx = this.createContext(node, context);
       
       // Check if it has child nodes (it's a group)
       if (node.nodes && node.nodes.length > 0) {
         return this.executeGroup(node, ctx);
       }
       
       // Single node - use transport or execute locally
       if (this.config.transport) {
         return this.config.transport.execute(node, ctx);
       }
       
       return this.executeLocal(node, ctx);
     }
     
     private async executeGroup(node: NodeDefinition, context: ExecutionContext): Promise<ExecutionResult> {
       // Execute children in topological order
       const sorted = this.topologicalSort(node.nodes || [], node.edges || []);
       const results = [];
       
       for (const childNode of sorted) {
         const result = await this.execute(childNode, {
           ...context,
           parentContext: context
         });
         results.push(result);
         
         if (!result.success) {
           return {
             success: false,
             error: result.error,
             executedNodes: results.map(r => r.nodeId)
           };
         }
       }
       
       return {
         success: true,
         data: results,
         executedNodes: results.map(r => r.nodeId)
       };
     }
   }
   
   export function createConductor(config?: ConductorConfig): Conductor {
     return new Conductor(config);
   }
   ```

4. UPDATE all imports across codebase:
   - Find: import { ExecutionContext, ExecutionResult } from '@atomiton/flow'
   - Replace with: import { ExecutionContext, ExecutionResult } from '@atomiton/conductor'

After this step, run: pnpm build -F @atomiton/conductor
```

---

## Step 3: Remove Flow Package Completely

**Goal**: Delete @atomiton/flow package. Don't move anything - we already have what we need.

### Claude Code Prompt:

```
Remove the @atomiton/flow package entirely. We don't need its utilities.

1. DO NOT move anything from @atomiton/flow:
   - Don't move utilities - we have createNodeDefinition already
   - Don't move validation - we'll create it when needed
   - Don't move type guards - checking node.nodes is enough
   - Just delete everything

2. UPDATE @atomiton/storage to handle flow files:
   ```typescript
   // /packages/@atomiton/storage/src/types/flow-file.ts
   import type { NodeDefinition } from '@atomiton/nodes';
   
   // "Flow" is just what users call a saved node tree
   export interface FlowFile {
     version: string;  // File format version
     metadata: {
       name: string;
       description?: string;
       author?: string;
       createdAt: Date;
       updatedAt: Date;
     };
     root: NodeDefinition;  // The actual node tree
   }
   
   // /packages/@atomiton/storage/src/flow-storage.ts
   export async function saveFlowFile(
     node: NodeDefinition, 
     metadata: FlowMetadata
   ): Promise<void> {
     const file: FlowFile = {
       version: '1.0.0',
       metadata,
       root: node
     };
     await writeYaml(path, file);
   }
   
   export async function loadFlowFile(path: string): Promise<NodeDefinition> {
     const file = await readYaml<FlowFile>(path);
     return file.root;  // Just return the node tree
   }
   ```

3. UPDATE @atomiton/editor transformations:
   ```typescript
   // /packages/@atomiton/editor/src/utils/transform.ts
   import { NodeDefinition, createNodeDefinition } from '@atomiton/nodes';
   
   export function nodeToReactFlow(node: NodeDefinition) {
     const reactNodes = [];
     const reactEdges = [];
     
     if (node.nodes) {
       reactNodes.push(...node.nodes.map(n => ({
         id: n.id,
         type: n.type,
         position: n.position,
         data: { ...n.parameters, parentId: node.id }
       })));
     }
     
     if (node.edges) {
       reactEdges.push(...node.edges.map(e => ({
         id: e.id,
         source: e.source,
         target: e.target
       })));
     }
     
     return { nodes: reactNodes, edges: reactEdges };
   }
   
   export function reactFlowToNode(
     reactNodes, 
     reactEdges, 
     baseNode?: NodeDefinition
   ): NodeDefinition {
     return createNodeDefinition({
       ...baseNode,
       type: baseNode?.type || 'group',
       nodes: reactNodes.map(n => ({
         id: n.id,
         type: n.type,
         position: n.position,
         parentId: baseNode?.id,
         parameters: n.data
       })),
       edges: reactEdges
     });
   }
   ```

4. UPDATE all imports:
   - Search entire codebase for: '@atomiton/flow'
   - Replace with '@atomiton/nodes' for NodeDefinition
   - Replace with '@atomiton/conductor' for execution types
   - Use createNodeDefinition from @atomiton/nodes

5. DELETE the package:
   - rm -rf /packages/@atomiton/flow
   - Remove from pnpm-workspace.yaml
   - Remove from all package.json files

After this step, run: pnpm install && pnpm build
Verify with: pnpm why @atomiton/flow (should fail)
```

---

## Step 4: Clean RPC to Pure Transport

**Goal**: Ensure RPC is only message passing with no business logic.

### Claude Code Prompt:

```
Clean @atomiton/rpc to be pure transport with zero business logic.

1. SIMPLIFY RPC types:
   ```typescript
   // /packages/@atomiton/rpc/src/types.ts
   export interface RPCRequest<T = any> {
     id: string;
     method: string;
     params: T;
   }
   
   export interface RPCResponse<T = any> {
     id: string;
     result?: T;
     error?: RPCError;
   }
   
   export interface RPCError {
     code: number;
     message: string;
     data?: any;
   }
   ```

2. CREATE message types for node execution:
   ```typescript
   // /packages/@atomiton/rpc/src/messages/execute.ts
   import type { NodeDefinition } from '@atomiton/nodes';
   import type { ExecutionContext, ExecutionResult } from '@atomiton/conductor';
   
   export interface ExecuteNodeRequest {
     node: NodeDefinition;
     context?: Partial<ExecutionContext>;
   }
   
   export interface ExecuteNodeResponse {
     result: ExecutionResult;
   }
   ```

3. REMOVE any business logic:
   - No node execution
   - No validation
   - No checking if nodes have children
   - Just message passing

After this step, run: pnpm build -F @atomiton/rpc
```

---

## Step 5: Implement Conductor-based Client Architecture

**Goal**: Client uses Conductor API, RPC becomes an implementation detail.

### Claude Code Prompt:

```
Make the client use Conductor's simple execute API instead of RPC directly.

1. CREATE Conductor wrapper in client:
   ```typescript
   // /apps/client/src/lib/conductor/index.ts
   import { createConductor, type ConductorTransport } from '@atomiton/conductor';
   import type { NodeDefinition } from '@atomiton/nodes';
   
   // Create RPC transport only if in Electron
   const createRPCTransport = (): ConductorTransport | undefined => {
     if (!window.electron) return undefined;
     
     return {
       async execute(node, context) {
         const response = await window.electron.ipc.invoke('execute-node', {
           node,
           context
         });
         return response;
       }
     };
   };
   
   // Export conductor instance
   export const conductor = createConductor({
     transport: createRPCTransport()
   });
   
   // Simple API - just execute
   export const execute = (node: NodeDefinition) => conductor.execute(node);
   ```

2. UPDATE Desktop handlers:
   ```typescript
   // /apps/desktop/src/main/handlers/conductor.ts
   import { createConductor } from '@atomiton/conductor';
   import { ipcMain } from 'electron';
   
   const conductor = createConductor();  // No transport, executes locally
   
   ipcMain.handle('execute-node', async (event, { node, context }) => {
     return conductor.execute(node, context);
   });
   ```

3. UPDATE all client code:
   - Remove: import { ipc } from '#lib/ipc'
   - Add: import { execute } from '#lib/conductor'
   - Replace: await ipc.executeNode(...) with await execute(node)

4. The API is now just: execute(node) - that's it!

After this step, run: pnpm dev and test execution
```

---

## Step 6: Final Validation and Cleanup

**Goal**: Ensure the architecture is clean and properly layered.

### Claude Code Prompt:

```
Validate the final architecture and clean up any remaining issues.

1. VERIFY package dependencies:
   - @atomiton/nodes: NO @atomiton dependencies
   - @atomiton/conductor: ONLY @atomiton/nodes
   - @atomiton/storage: ONLY @atomiton/nodes
   - @atomiton/editor: ONLY @atomiton/nodes
   - @atomiton/rpc: @atomiton/nodes and @atomiton/conductor (types only)

2. CHECK for circular dependencies:
   pnpm dlx madge --circular packages/

3. VERIFY Flow package is gone:
   pnpm why @atomiton/flow  # Should fail

4. VERIFY we're using existing utilities:
   - Using createNodeDefinition from @atomiton/nodes
   - Using conductor.execute() for execution
   - Not creating unnecessary abstractions

5. TEST the application:
   - Create a node tree in editor
   - Execute with: await execute(node)
   - Save as .flow.yaml
   - Load and execute again

6. The entire execution API is just:
   ```typescript
   import { execute } from '#lib/conductor';
   import { createNodeDefinition } from '@atomiton/nodes';
   
   const node = createNodeDefinition({ type: 'group', nodes: [...] });
   const result = await execute(node);
   ```

That's it - super simple!
```

---

## Success Criteria

After completing all steps:

✅ @atomiton/flow package doesn't exist
✅ No duplicate type definitions  
✅ Conductor owns all execution types
✅ Using existing createNodeDefinition from nodes package
✅ Simple execute(node) API from conductor
✅ Client never imports RPC directly
✅ "Flow" only appears in user-facing contexts
✅ No unnecessary abstractions or utilities

## The Simplest Possible API

### Creating Nodes
```typescript
import { createNodeDefinition } from '@atomiton/nodes';

const node = createNodeDefinition({
  type: 'group',
  nodes: [...]
});
```

### Executing Nodes
```typescript
import { execute } from '#lib/conductor';

const result = await execute(node);
```

That's the entire API - two functions!

## Common Pitfalls to Avoid

❌ **DON'T** create new utilities when we have existing ones
❌ **DON'T** create abstractions (isAtomic, isComposite, etc.)
❌ **DON'T** move Flow utilities - just delete them
❌ **DON'T** complicate the execute API
❌ **DON'T** skip steps - the order matters!

## Quick Validation Commands

```bash
# After each step
pnpm build

# Final validation
pnpm why @atomiton/flow         # Should fail
pnpm dlx madge --circular       # No circles
pnpm tsc --noEmit               # No type errors
pnpm test                       # All pass
pnpm dev                        # App works
```
