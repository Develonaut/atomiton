# Post Migration Cleanup Strategy

## Overview

This document provides a step-by-step strategy to implement our architectural decisions. These steps **MUST** be executed in order as each builds on the previous one.

**CRITICAL**: The order matters! Later steps depend on earlier ones being complete.

## Architectural Decisions Recap

1. **Nodes is the foundation** - Structure AND co-located implementations
2. **Flow package will be removed** - Flow is just a user concept  
3. **Conductor owns orchestration** - When and how to execute
4. **Events (formerly RPC) is pure transport** - Environment-aware message passing
5. **Client uses Conductor** - Events/transport is an implementation detail
6. **No abstractions** - Just check `node.nodes` array to see if it's a group
7. **Keep co-location** - Node definitions and implementations stay together

---

## Step 1: Simplify Execution Types in Nodes Package

**Goal**: Keep co-located node implementations but with simple execution interface.

### Claude Code Prompt:

```
Simplify the execution types in @atomiton/nodes while keeping implementations co-located with definitions.

1. CREATE simple execution interface:
   ```typescript
   // /packages/@atomiton/nodes/src/types/executable.ts
   export interface NodeExecutable {
     // Simple interface - just params in, result out
     execute(params: any): Promise<any>;
   }
   
   // Simple result type
   export interface NodeResult<T = any> {
     data?: T;
     error?: string;
   }
   ```

2. ENSURE node implementations follow simple pattern:
   ```typescript
   // Example: /packages/@atomiton/nodes/src/library/http-request/index.ts
   import type { NodeExecutable } from '../../types/executable';
   
   export const httpRequestDefinition = {
     type: 'httpRequest',
     version: '1.0.0',
     inputPorts: [...],
     outputPorts: [...],
     schema: {...}
   };
   
   export const httpRequestExecutable: NodeExecutable = {
     async execute(params) {
       // Simple implementation - no ExecutionContext needed
       const response = await fetch(params.url, {
         method: params.method || 'GET',
         headers: params.headers || {},
         body: params.body
       });
       return response.json();
     }
   };
   
   // Co-located registration
   export const httpRequestNode = {
     definition: httpRequestDefinition,
     executable: httpRequestExecutable
   };
   ```

3. KEEP the registry in nodes package:
   ```typescript
   // /packages/@atomiton/nodes/src/registry/index.ts
   import { httpRequestNode } from '../library/http-request';
   import { transformNode } from '../library/transform';
   
   export const nodeRegistry = new Map();
   
   // Register all node types
   nodeRegistry.set('httpRequest', httpRequestNode);
   nodeRegistry.set('transform', transformNode);
   // etc...
   
   export function getNodeImplementation(type: string) {
     return nodeRegistry.get(type);
   }
   ```

4. VERIFY core types are properly defined:
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
   
   // Keep existing utilities
   export function createNodeDefinition(params: Partial<NodeDefinition>): NodeDefinition
   ```

5. The nodes package now contains:
   - Simple type definitions
   - Co-located node implementations (definition + executable)
   - Registry of all node types
   - Simple NodeExecutable interface
   - NO complex ExecutionContext (that's Conductor's job)

After this step, run: pnpm build -F @atomiton/nodes
```

---

## Step 2: Update Conductor to Use Simple Node Executables

**Goal**: Make Conductor orchestrate the simple node executables with rich execution context.

### Claude Code Prompt:

```
Update @atomiton/conductor to wrap simple node executables with rich execution context.

1. CREATE rich execution types in Conductor:
   ```typescript
   // /packages/@atomiton/conductor/src/types/execution.ts
   import type { NodeResult } from '@atomiton/nodes';
   
   export interface ExecutionContext {
     nodeId: string;
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
   export interface ConductorTransport {
     execute(node: NodeDefinition, context: ExecutionContext): Promise<ExecutionResult>;
   }
   ```

3. IMPLEMENT Conductor that wraps simple executables:
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
       
       return this.executeLocal(node, ctx);
     }
     
     private async executeLocal(node: NodeDefinition, context: ExecutionContext): Promise<ExecutionResult> {
       const startTime = Date.now();
       
       // Get the simple executable from the registry
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
         // Call the simple execute function
         const result = await nodeImpl.executable.execute(node.parameters);
         
         // Wrap with rich execution result
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
   }
   
   export function createConductor(config?: ConductorConfig): Conductor {
     return new Conductor(config);
   }
   ```

4. The Conductor now:
   - Uses simple NodeExecutable from nodes package
   - Adds rich execution context around them
   - Handles orchestration and error handling
   - Provides transport abstraction

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
   ```

4. UPDATE all imports:
   - Search entire codebase for: '@atomiton/flow'
   - Replace with '@atomiton/nodes' for NodeDefinition
   - Replace with '@atomiton/conductor' for execution types

5. DELETE the package:
   - rm -rf /packages/@atomiton/flow
   - Remove from pnpm-workspace.yaml
   - Remove from all package.json files

After this step, run: pnpm install && pnpm build
Verify with: pnpm why @atomiton/flow (should fail)
```

---

## Step 4: Clean RPC to Pure Transport (Prepare for Rename)

**Goal**: Clean RPC to be pure transport, preparing for rename to events.

### Claude Code Prompt:

```
Clean @atomiton/rpc to be pure transport with zero business logic.

1. SIMPLIFY transport types:
   ```typescript
   // /packages/@atomiton/rpc/src/types.ts
   export interface TransportRequest<T = any> {
     id: string;
     method: string;
     params: T;
   }
   
   export interface TransportResponse<T = any> {
     id: string;
     result?: T;
     error?: TransportError;
   }
   
   export interface TransportError {
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

4. PREPARE for environment detection (future):
   ```typescript
   // /packages/@atomiton/rpc/src/transport.ts
   export function getTransport() {
     // For now, always IPC
     // Future: detect environment and return appropriate transport
     return ipcTransport;
   }
   ```

After this step, run: pnpm build -F @atomiton/rpc
```

---

## Step 5: Implement Conductor-based Client Architecture

**Goal**: Client uses Conductor API, transport is an implementation detail.

### Claude Code Prompt:

```
Make the client use Conductor's simple execute API with transport as a detail.

1. CREATE Conductor wrapper in client:
   ```typescript
   // /apps/client/src/lib/conductor/index.ts
   import { createConductor, type ConductorTransport } from '@atomiton/conductor';
   import type { NodeDefinition } from '@atomiton/nodes';
   
   // Create transport based on environment (for now, just IPC)
   const createTransport = (): ConductorTransport | undefined => {
     if (!window.electron) return undefined;
     
     return {
       async execute(node, context) {
         // This will change when we rename to events
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
     transport: createTransport()
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

After this step, run: pnpm dev and test execution
```

---

## Step 6: Rename RPC to Events Package

**Goal**: Rename @atomiton/rpc to @atomiton/events for flexible, environment-aware transport.

### Claude Code Prompt:

```
Rename @atomiton/rpc to @atomiton/events and make it environment-aware transport.

1. RENAME the package:
   ```bash
   mv packages/@atomiton/rpc packages/@atomiton/events
   ```

2. UPDATE package.json:
   ```json
   // /packages/@atomiton/events/package.json
   {
     "name": "@atomiton/events",
     "description": "Environment-aware event transport layer"
   }
   ```

3. CREATE environment detection:
   ```typescript
   // /packages/@atomiton/events/src/environment.ts
   export enum TransportType {
     IPC = 'ipc',
     WEBSOCKET = 'websocket',
     HTTP = 'http'
   }
   
   export function detectEnvironment(): TransportType {
     // For now, always IPC
     // Future logic:
     // - If Electron: return TransportType.IPC
     // - If WebSocket available: return TransportType.WEBSOCKET
     // - Fallback: return TransportType.HTTP
     return TransportType.IPC;
   }
   ```

4. CREATE generic event system:
   ```typescript
   // /packages/@atomiton/events/src/events.ts
   export interface EventMessage<T = any> {
     id: string;
     type: string;  // 'execute', 'cancel', 'status', etc.
     payload: T;
     timestamp: Date;
   }
   
   export interface EventResponse<T = any> {
     id: string;
     success: boolean;
     data?: T;
     error?: EventError;
   }
   
   export interface EventError {
     code: string;
     message: string;
     details?: any;
   }
   
   // Generic event emitter interface
   export interface EventTransport {
     send<T, R>(message: EventMessage<T>): Promise<EventResponse<R>>;
     on<T>(type: string, handler: (payload: T) => any): void;
     off(type: string, handler: Function): void;
   }
   ```

5. IMPLEMENT IPC transport (current):
   ```typescript
   // /packages/@atomiton/events/src/transports/ipc.ts
   import { ipcMain, ipcRenderer } from 'electron';
   import type { EventTransport, EventMessage, EventResponse } from '../events';
   
   export class IPCTransport implements EventTransport {
     async send<T, R>(message: EventMessage<T>): Promise<EventResponse<R>> {
       if (process.type === 'renderer') {
         return ipcRenderer.invoke('event', message);
       }
       // Main process implementation
     }
     
     on<T>(type: string, handler: (payload: T) => any): void {
       // Register handler
     }
     
     off(type: string, handler: Function): void {
       // Unregister handler
     }
   }
   ```

6. CREATE transport factory:
   ```typescript
   // /packages/@atomiton/events/src/index.ts
   import { detectEnvironment, TransportType } from './environment';
   import { IPCTransport } from './transports/ipc';
   // Future: import { WebSocketTransport } from './transports/websocket';
   // Future: import { HTTPTransport } from './transports/http';
   
   export function createEventTransport(): EventTransport {
     const environment = detectEnvironment();
     
     switch (environment) {
       case TransportType.IPC:
         return new IPCTransport();
       // Future cases:
       // case TransportType.WEBSOCKET:
       //   return new WebSocketTransport();
       // case TransportType.HTTP:
       //   return new HTTPTransport();
       default:
         return new IPCTransport();
     }
   }
   
   // Export for backward compatibility during migration
   export { createEventTransport as createTransport };
   ```

7. UPDATE all imports:
   - Find: `from '@atomiton/rpc'`
   - Replace: `from '@atomiton/events'`
   - Update function names to be more generic (event-based rather than RPC-specific)

8. UPDATE client conductor wrapper:
   ```typescript
   // /apps/client/src/lib/conductor/index.ts
   import { createEventTransport } from '@atomiton/events';
   
   const transport = createEventTransport();
   
   const createTransport = (): ConductorTransport | undefined => {
     if (!transport) return undefined;
     
     return {
       async execute(node, context) {
         const response = await transport.send({
           id: generateId(),
           type: 'execute',
           payload: { node, context },
           timestamp: new Date()
         });
         return response.data;
       }
     };
   };
   ```

After this step, run: pnpm install && pnpm build
The package is now @atomiton/events with flexible transport!
```

---

## Step 7: Final Validation and Cleanup

**Goal**: Ensure the architecture is clean and properly layered with the new events system.

### Claude Code Prompt:

```
Validate the final architecture with the renamed events package.

1. VERIFY package dependencies:
   - @atomiton/nodes: NO @atomiton dependencies (foundation)
   - @atomiton/conductor: ONLY @atomiton/nodes
   - @atomiton/storage: ONLY @atomiton/nodes
   - @atomiton/editor: ONLY @atomiton/nodes
   - @atomiton/events: @atomiton/nodes and @atomiton/conductor (types only)

2. CHECK for circular dependencies:
   pnpm dlx madge --circular packages/

3. VERIFY Flow package is gone:
   pnpm why @atomiton/flow  # Should fail

4. VERIFY RPC package is renamed:
   pnpm why @atomiton/rpc   # Should fail
   pnpm why @atomiton/events # Should succeed

5. TEST the application:
   - Create a node tree in editor
   - Execute with: await execute(node)
   - Verify events are being transmitted correctly
   - Save as .flow.yaml
   - Load and execute again

6. The architecture is now:
   - Nodes: Structure + co-located implementations
   - Conductor: Orchestration with rich execution context
   - Events: Environment-aware transport layer
   - Storage: User-facing "flow" concept
   - Editor: Visual transformation

That's it - clean, simple, and future-proof!
```

---

## Success Criteria

After completing all steps:

✅ @atomiton/flow package doesn't exist
✅ @atomiton/rpc renamed to @atomiton/events
✅ No duplicate type definitions  
✅ Node implementations co-located with definitions
✅ Simple NodeExecutable interface in nodes
✅ Rich ExecutionContext in conductor
✅ Environment-aware event transport
✅ Client uses simple execute(node) API
✅ "Flow" only appears in user-facing contexts

## The Final Architecture

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
// Transport (IPC, WebSocket, HTTP) is handled automatically!
```

## Benefits of This Approach

1. **Co-location preserved** - Node definitions and implementations stay together
2. **Simple interfaces** - NodeExecutable is just `(params) => result`
3. **Rich orchestration** - Conductor adds execution context
4. **Future-proof transport** - Events package can adapt to any environment
5. **Clean separation** - Each package has one clear responsibility

## Quick Validation Commands

```bash
# After each step
pnpm build

# Final validation
pnpm why @atomiton/flow         # Should fail
pnpm why @atomiton/rpc          # Should fail  
pnpm why @atomiton/events       # Should succeed
pnpm dlx madge --circular       # No circles
pnpm tsc --noEmit               # No type errors
pnpm test                       # All pass
pnpm dev                        # App works
```
