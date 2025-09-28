# Post Migration Cleanup Strategy

## Overview

This document provides a step-by-step strategy to implement our architectural decisions. These steps **MUST** be executed in order as each builds on the previous one.

**CRITICAL**: The order matters! Later steps depend on earlier ones being complete.

## Architectural Decisions Recap

1. **Nodes has co-located implementations** - Definition + execution together
2. **Simple execution interface** - Just params in, result out
3. **Flow package will be removed** - Flow is just a user concept  
4. **Conductor orchestrates** - Adds execution context and orchestration
5. **RPC is pure transport** - No business logic
6. **Client uses Conductor** - RPC is an implementation detail
7. **No abstractions** - Just check `node.nodes` array to see if it's a group

---

## Step 1: Simplify Execution Types in Nodes Package

**Goal**: Keep co-location but simplify the execution interface in @atomiton/nodes.

### Claude Code Prompt:

```
Simplify the execution types in @atomiton/nodes while keeping implementations co-located with definitions.

1. SIMPLIFY the NodeExecutable interface:
   ```typescript
   // /packages/@atomiton/nodes/src/types/executable.ts
   
   // Simple interface - just params in, result out
   export interface NodeExecutable {
     execute(params: any): Promise<any>;
   }
   
   // Optional: Simple result type if needed
   export interface NodeResult {
     success: boolean;
     data?: any;
     error?: string;
   }
   ```

2. KEEP node implementations co-located:
   ```typescript
   // /packages/@atomiton/nodes/src/library/http-request/index.ts
   import type { NodeExecutable } from '../../types/executable';
   
   export const httpRequestDefinition = {
     type: 'httpRequest',
     version: '1.0.0',
     inputPorts: [
       { id: 'url', type: 'string', required: true },
       { id: 'method', type: 'string', required: false }
     ],
     outputPorts: [
       { id: 'data', type: 'any' },
       { id: 'status', type: 'number' }
     ]
   };
   
   export const httpRequestExecutable: NodeExecutable = {
     async execute(params) {
       const response = await fetch(params.url, {
         method: params.method || 'GET'
       });
       
       return {
         data: await response.json(),
         status: response.status
       };
     }
   };
   
   // Export both together
   export const httpRequestNode = {
     definition: httpRequestDefinition,
     executable: httpRequestExecutable
   };
   ```

3. MAINTAIN the registry in nodes:
   ```typescript
   // /packages/@atomiton/nodes/src/registry/index.ts
   import { httpRequestNode } from '../library/http-request';
   import { transformNode } from '../library/transform';
   // ... other nodes
   
   export const nodeRegistry = new Map();
   
   // Register all nodes
   nodeRegistry.set('httpRequest', httpRequestNode);
   nodeRegistry.set('transform', transformNode);
   // etc...
   
   export function getNodeImplementation(type: string) {
     return nodeRegistry.get(type);
   }
   ```

4. ENSURE core structural types remain simple:
   ```typescript
   // /packages/@atomiton/nodes/src/types/index.ts
   export interface NodeDefinition {
     id: string;
     type: string;  // 'group', 'httpRequest', 'transform', etc.
     version?: string;
     parentId?: string;
     name?: string;
     position?: { x: number; y: number };
     metadata?: NodeMetadata;
     parameters?: Record<string, any>;
     inputPorts?: NodePort[];
     outputPorts?: NodePort[];
     nodes?: NodeDefinition[];  // If present, it's a group node
     edges?: NodeEdge[];
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

5. VERIFY existing utilities:
   ```typescript
   export function createNodeDefinition(params: Partial<NodeDefinition>): NodeDefinition
   ```

After this step, run: pnpm build -F @atomiton/nodes
```

---

## Step 2: Enhance Execution in Conductor

**Goal**: Conductor imports simple types from nodes and adds orchestration/context.

### Claude Code Prompt:

```
Set up @atomiton/conductor to use the simple execution types from nodes and add orchestration.

1. IMPORT simple types from nodes and enhance them:
   ```typescript
   // /packages/@atomiton/conductor/src/types/execution.ts
   import type { NodeExecutable } from '@atomiton/nodes';
   
   // Conductor adds richer execution context
   export interface ExecutionContext {
     nodeId: string;
     executionId: string;
     variables: Record<string, any>;
     input?: any;
     parentContext?: ExecutionContext;
   }
   
   // Enhanced result with more metadata
   export interface ExecutionResult<T = any> {
     success: boolean;
     data?: T;
     error?: ExecutionError;
     duration?: number;
     executedNodes?: string[];
     context?: ExecutionContext;
   }
   
   export interface ExecutionError {
     nodeId: string;
     message: string;
     code?: string;
     timestamp: Date;
   }
   ```

2. CREATE transport abstraction:
   ```typescript
   // /packages/@atomiton/conductor/src/types/transport.ts
   import type { NodeDefinition } from '@atomiton/nodes';
   
   export interface ConductorTransport {
     execute(node: NodeDefinition, context: ExecutionContext): Promise<ExecutionResult>;
   }
   ```

3. IMPLEMENT Conductor using nodes registry:
   ```typescript
   // /packages/@atomiton/conductor/src/conductor.ts
   import { NodeDefinition, getNodeImplementation } from '@atomiton/nodes';
   
   export class Conductor {
     constructor(private config: { transport?: ConductorTransport } = {}) {}
     
     async execute(node: NodeDefinition, context?: Partial<ExecutionContext>): Promise<ExecutionResult> {
       const ctx = this.createContext(node, context);
       const startTime = Date.now();
       
       // Check if it has child nodes (it's a group)
       if (node.nodes && node.nodes.length > 0) {
         return this.executeGroup(node, ctx);
       }
       
       // Single node - use transport or execute locally
       if (this.config.transport) {
         return this.config.transport.execute(node, ctx);
       }
       
       return this.executeLocal(node, ctx, startTime);
     }
     
     private async executeLocal(
       node: NodeDefinition, 
       context: ExecutionContext,
       startTime: number
     ): Promise<ExecutionResult> {
       // Get implementation from nodes registry
       const nodeImpl = getNodeImplementation(node.type);
       
       if (!nodeImpl) {
         return {
           success: false,
           error: {
             nodeId: node.id,
             message: `No implementation found for node type: ${node.type}`,
             timestamp: new Date()
           }
         };
       }
       
       try {
         // Call the simple execute method from nodes
         const result = await nodeImpl.executable.execute(node.parameters);
         
         // Conductor adds the execution context and metadata
         return {
           success: true,
           data: result,
           duration: Date.now() - startTime,
           executedNodes: [node.id],
           context
         };
       } catch (error) {
         return {
           success: false,
           error: {
             nodeId: node.id,
             message: error.message,
             timestamp: new Date()
           },
           duration: Date.now() - startTime
         };
       }
     }
     
     private async executeGroup(node: NodeDefinition, context: ExecutionContext): Promise<ExecutionResult> {
       const startTime = Date.now();
       const sorted = this.topologicalSort(node.nodes || [], node.edges || []);
       const results = [];
       const executedNodes = [];
       
       for (const childNode of sorted) {
         const result = await this.execute(childNode, {
           ...context,
           parentContext: context
         });
         
         results.push(result);
         executedNodes.push(...(result.executedNodes || []));
         
         if (!result.success) {
           return {
             success: false,
             error: result.error,
             duration: Date.now() - startTime,
             executedNodes
           };
         }
       }
       
       return {
         success: true,
         data: results,
         duration: Date.now() - startTime,
         executedNodes
       };
     }
   }
   
   export function createConductor(config?: ConductorConfig): Conductor {
     return new Conductor(config);
   }
   ```

4. UPDATE package.json:
   ```json
   {
     "dependencies": {
       "@atomiton/nodes": "workspace:*"
     }
   }
   ```

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
   - Replace with '@atomiton/conductor' for richer execution types
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
   - @atomiton/nodes: NO @atomiton dependencies (foundation with co-located implementations)
   - @atomiton/conductor: ONLY @atomiton/nodes
   - @atomiton/storage: ONLY @atomiton/nodes
   - @atomiton/editor: ONLY @atomiton/nodes
   - @atomiton/rpc: @atomiton/nodes and @atomiton/conductor (types only)

2. CHECK for circular dependencies:
   pnpm dlx madge --circular packages/

3. VERIFY Flow package is gone:
   pnpm why @atomiton/flow  # Should fail

4. VERIFY co-location is maintained:
   - Each node type in @atomiton/nodes has definition + implementation together
   - Simple NodeExecutable interface (params in, result out)
   - Conductor adds execution context and orchestration

5. TEST the application:
   - Create a node tree in editor
   - Execute with: await execute(node)
   - Save as .flow.yaml
   - Load and execute again

6. The architecture is now:
   - @atomiton/nodes: Co-located definitions + implementations with simple interface
   - @atomiton/conductor: Orchestration and execution context
   - Simple API: createNodeDefinition() and execute()
```

---

## Success Criteria

After completing all steps:

✅ @atomiton/flow package doesn't exist
✅ Node definitions and implementations are co-located in @atomiton/nodes
✅ Simple NodeExecutable interface (params → result)
✅ Conductor adds execution context and orchestration
✅ Using existing createNodeDefinition from nodes package
✅ Simple execute(node) API from conductor
✅ Client never imports RPC directly
✅ "Flow" only appears in user-facing contexts

## Architecture Summary

### Package Responsibilities

```
@atomiton/nodes (Foundation)
├── NodeDefinition type
├── Simple NodeExecutable interface
├── Co-located node implementations
├── Registry of all nodes
└── createNodeDefinition utility

@atomiton/conductor (Orchestration)
├── Imports simple types from nodes
├── Adds ExecutionContext
├── Adds ExecutionResult with metadata
├── Handles orchestration (groups, sequencing)
└── Transport abstraction

@atomiton/rpc (Transport)
└── Pure message passing

@atomiton/storage (Persistence)
└── Flow files (user concept)

@atomiton/editor (Visualization)
└── Visual transformations
```

### The Simple API

```typescript
// Create nodes
import { createNodeDefinition } from '@atomiton/nodes';
const node = createNodeDefinition({ type: 'group', nodes: [...] });

// Execute nodes
import { execute } from '#lib/conductor';
const result = await execute(node);
```

## Common Pitfalls to Avoid

❌ **DON'T** split node definitions from implementations
❌ **DON'T** create complex execution interfaces
❌ **DON'T** move Flow utilities - just delete them
❌ **DON'T** put execution context in nodes package
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
