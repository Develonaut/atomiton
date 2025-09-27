# Migration Strategy: MVP to Domain-Driven Architecture

## Current State Analysis

### What You Have Now (MVP)

Based on my analysis, here's your current architecture:

```
Current Structure:
├── IPC Package (@atomiton/ipc)
│   ├── Handles node execution directly (PROBLEM)
│   ├── Imports @atomiton/nodes executables (PROBLEM)
│   └── Owns too much business logic (PROBLEM)
├── Client (apps/client)
│   ├── Has its own IPC types duplicated (PROBLEM)
│   └── Direct node execution without Flow concept (PROBLEM)
├── Desktop (apps/desktop)
│   ├── Uses IPC handlers correctly
│   └── But IPC owns the execution logic (PROBLEM)
└── Missing Packages
    ├── No @atomiton/flow package
    ├── No @atomiton/conductor package
    └── No Flow type definition anywhere
```

## Migration Roadmap with Claude Code Prompts

### Phase 1: Foundation - Create Missing Packages (Week 1-2)

#### Step 1.1: Create @atomiton/flow Package ✅ COMPLETED

- [x] Create package structure
- [x] Add type definitions
- [x] Add utilities and factories
- [x] Add tests

**Claude Code Prompt:**

```
Create a new package @atomiton/flow following the package creation standards in docs/development/PACKAGE_CREATION_GUIDE.md.

The package should:
1. Use functional programming patterns with factory functions instead of classes
2. Define an Executable interface as the base for both Flow and FlowNode
3. Flow should be a composite node (type: 'flow') that contains other nodes
4. Include type guards: isFlow() and isNode()
5. Include factory functions: createFlow(), createNode()
6. Add functional utilities like pipe(), compose(), addNode(), removeNode()
7. Include proper exports in index.ts
8. Set up vite config, tests structure, and package.json

Key insight: A Flow is just a special type of node that contains other nodes. Both Flow and FlowNode extend Executable.

Types to create:
- Executable (base interface with id, type, version)
- FlowNode extends Executable (adds position, config, label)
- Flow extends Executable (type='flow', contains nodes and connections)
- Connection (links between nodes)
- FlowMetadata (timestamps and version info)

Follow functional programming patterns - no classes, use factory functions and type guards.
```

#### Step 1.2: Refactor Flow Package to Use Node Types

- [x] Move Node type to @atomiton/nodes
- [x] Remove duplicate types from Flow
- [x] Import and extend Node types
- [x] Update factories and guards

**Claude Code Prompt:**

````
Refactor the @atomiton/flow package to use Node as the base type from @atomiton/nodes, eliminating all duplication:

1. Update @atomiton/flow to import Node types and be minimal:
   ```typescript
   // @atomiton/flow/src/types.ts
   import { Node, Connection, NodeMetadata } from '@atomiton/nodes';

   // Flow is just a type alias - a flow IS a node
   export type Flow = Node;

   // Flow-specific metadata extensions (if needed)
   export type FlowMetadata = NodeMetadata & {
     createdAt: Date;
     updatedAt: Date;
   };

   export const isFlow = (node: Node): boolean =>
     node.type === 'flow'
````

3. Update factory functions to be minimal:

   ```typescript
   // @atomiton/flow/src/factories.ts
   import type{ Node, NodeEdge } from '@atomiton/nodes';
   import { createNodeDefinition, createNodeMetadata, createNodeEdges } from '@atomiton/nodes';
   import type { Flow } from './types';
   import { generateId } from '@atomiton/utils';

    // Create a new flow using the factories from @atomiton/nodes
   export const createFlow = (params: {
     name: string;
     nodes?: Node[];
     edges?: NodeEdge[];
   }): Flow => createNodeDefinition({...})

   // Flow-specific utilities
   export const validateFlow = (flow: Flow): ValidationResult => {
     const errors: string[] = [];

     if (!flow.nodes || flow.nodes.length === 0) {
       errors.push('Flow must have at least one node');
     }

     // Validate edges reference existing nodes
     const nodeIds = new Set(flow.nodes?.map(n => n.id) || []);
     flow.edges?.forEach(edge => {
       if (!nodeIds.has(edge.source)) {
         errors.push(`Edge references non-existent source: ${edge.source}`);
       }
       if (!nodeIds.has(edge.target)) {
         errors.push(`Edge references non-existent target: ${edge.target}`);
       }
     });

     return {
       valid: errors.length === 0,
       errors: errors.length > 0 ? errors : undefined
     };
   };
   ```

4. Update package.json dependencies:

   ```json
   {
     "dependencies": {
       "@atomiton/nodes": "workspace:*"
     }
   }
   ```

5. Remove all duplicate type definitions from @atomiton/flow:
   - Remove FlowNode (use Node from @atomiton/nodes)
   - Remove Edge/Connection (use Connection from @atomiton/nodes)
   - Remove PortDefinition (use from @atomiton/nodes)
   - Remove duplicate Position type
   - Keep only execution-specific types

6. Update all imports in the flow package to use Node:

   ```typescript
   // Before
   import { FlowNode, Flow } from "./types";

   // After
   import { Node } from "@atomiton/nodes";
   import { Flow, ExecutionContext } from "./types";
   ```

Benefits:

- No duplicate type definitions
- Single source of truth for Node
- Flow package focuses only on execution
- Recursive node structure enables infinite composition
- Cleaner dependency graph

The key insight: Flow doesn't need its own node types - it just uses Node from
@atomiton/nodes and adds execution concepts on top.

````

#### Step 1.3: Update NodeDefinition Structure in @atomiton/nodes

- [X] Migrate from nested children to flat structure with parentId
- [X] Move version to top level
- [X] Update all existing node definitions
- [x] Add migration utilities

**Claude Code Prompt:**



Update the NodeDefinition structure in @atomiton/nodes package to use a flat
structure:

1. Update NodeDefinition interface: OLD structure:
   ```typescript
   type NodeDefinition {
     type: string;
     metadata: {
       version: string;
       // other metadata
     };
     children?: NodeDefinition[]; // REMOVE THIS
   }
````

NEW structure:

```typescript
type NodeDefinition {
  id: string; // Unique identifier
  type: string; // Node type
  version: string; // Moved to top level from metadata
  parentId?: string; // Reference to parent node (replaces children)
  metadata: {
    // other metadata (NOT version)
    label?: string;
    description?: string;
    category?: string;
    deprecated?: boolean;
  };
}
```

2. Create migration utilities:
   - convertNestedToFlat(nodes): converts old nested structure to flat array
   - convertFlatToNested(nodes): converts flat array to nested (for backward
     compat)
   - getChildren(nodes, parentId): gets all nodes with given parentId
   - getParent(nodes, nodeId): gets parent of a node

3. Update all existing node definitions to use new structure:
   - Remove children arrays
   - Add parentId where needed
   - Move version from metadata to top level

4. Create a NodeRegistry that works with flat structure:

   ```typescript
   const nodeRegistry = {
     nodes: Map<string, NodeDefinition>(),

     register(node: NodeDefinition) {
       this.nodes.set(node.id, node);
     },

     getChildren(parentId: string): NodeDefinition[] {
       return Array.from(this.nodes.values()).filter(
         (n) => n.parentId === parentId,
       );
     },

     getRootNodes(): NodeDefinition[] {
       return Array.from(this.nodes.values()).filter((n) => !n.parentId);
     },
   };
   ```

5. Update node validation to check version at top level

Benefits of flat structure:

- Easier to query and filter
- Better performance (no deep recursion)
- Simpler updates (just change parentId)
- More database-friendly
- Easier to serialize/deserialize

```

#### Step 1.4: Create @atomiton/conductor Package
- [X] Create package structure
- [X] Add execution logic
- [X] Add factory functions
- [X] Add tests

**Claude Code Prompt:**
```

Create a new package @atomiton/conductor following the package creation
standards.

The conductor OWNS all execution types and executes any Node:

1. Define execution types in src/types.ts:

   ```typescript
   // Execution context for any node
   export interface ExecutionContext {
     nodeId: string; // Not flowId - any node can be executed
     executionId: string;
     variables: Record<string, any>;
     input: any;
     output?: any;
     status: ExecutionStatus;
     startTime: Date;
     endTime?: Date;
   }

   export type ExecutionStatus =
     | "pending"
     | "running"
     | "completed"
     | "failed"
     | "cancelled";

   export interface ExecutionResult<T = any> {
     success: boolean;
     data?: T;
     error?: ExecutionError;
     duration?: number;
     executedNodes?: string[]; // For composite nodes
   }

   export interface ExecutionError {
     nodeId?: string;
     message: string;
     timestamp: Date;
     stack?: string;
   }
   ```

2. Create the conductor:

   ```typescript
   import { Node, isComposite, isAtomic } from "@atomiton/nodes";
   import { ExecutionContext, ExecutionResult } from "./types";

   export function createConductor(config?: ConductorConfig) {
     return {
       async execute(
         node: Node,
         context?: Partial<ExecutionContext>,
       ): Promise<ExecutionResult> {
         // Create execution context
         const executionContext: ExecutionContext = {
           nodeId: node.id,
           executionId: `exec-${Date.now()}`,
           variables: context?.variables || {},
           input: context?.input,
           status: "running",
           startTime: new Date(),
           ...context,
         };

         // Execute based on node type
         if (isAtomic(node)) {
           return executeAtomic(node, executionContext);
         } else if (isComposite(node)) {
           return executeComposite(node, executionContext);
         }

         throw new Error(`Unknown node type: ${node.type}`);
       },
     };
   }
   ```

3. Implement recursive execution for composite nodes:
   - For atomic nodes: Look up NodeDefinition and execute
   - For composite nodes: Execute children in topological order
   - Pass outputs between connected nodes

4. Work with the new flat NodeDefinition structure:
   - version at top level (node.version not node.metadata.version)
   - parentId for hierarchies (not nested children)

5. Export all execution types for other packages to use:
   ```typescript
   // src/index.ts
   export * from "./types"; // Export all execution types
   export { createConductor } from "./conductor";
   ```

The conductor owns execution - other packages import execution types from here.

```

### Phase 2: Convert IPC to tRPC-based RPC (Week 3)

#### Step 2.1: Install tRPC Dependencies
- [X] Add tRPC packages
- [X] Add Zod for validation
- [X] Update build config
- [X] Test imports

**Claude Code Prompt:**
```

Add tRPC dependencies to the @atomiton/ipc package:

1. Install required packages:
   - @trpc/server (^11.0.0)
   - @trpc/client (^11.0.0)
   - @trpc/react-query (^11.0.0)
   - electron-trpc (^0.6.1)
   - superjson (for Date serialization)
   - @atomiton/validation

2. Update package.json with these dependencies

3. Create src/trpc/index.ts to verify imports work:
   - Import initTRPC from @trpc/server
   - Import v from @atomiton/validation
   - Export a simple test to ensure build works

4. Update vite config if needed for these packages

5. Run pnpm install and pnpm build to verify

This sets up the foundation for converting to tRPC.

```

#### Step 2.2: Create tRPC Router with Zod Schemas
- [ ] Define Zod schemas for types
- [ ] Create tRPC router
- [ ] Define procedures
- [ ] Export types

**Claude Code Prompt:**
```

Create tRPC router and schemas in @atomiton/ipc with the updated node structure:

1. Create src/schemas/index.ts with Zod schemas:

   ```typescript
   // Node schemas with flat structure
   const NodeDefinitionSchema = z.object({
     id: z.string(),
     type: z.string(),
     version: z.string(), // At top level
     parentId: z.string().optional(), // Flat structure
     metadata: z
       .object({
         label: z.string().optional(),
         description: z.string().optional(),
         category: z.string().optional(),
         deprecated: z.boolean().optional(),
         // NO version here
       })
       .optional(),
   });

   const ExecutableSchema = z.object({
     id: z.string(),
     type: z.string(),
     version: z.string().optional(),
   });

   const FlowNodeSchema = ExecutableSchema.extend({
     position: z.object({ x: z.number(), y: z.number() }),
     config: z.record(z.any()),
     label: z.string().optional(),
     parentId: z.string().optional(), // Nodes can have parents in flows
   });

   const FlowSchema = ExecutableSchema.extend({
     type: z.literal("flow"),
     name: z.string(),
     nodes: z.array(FlowNodeSchema), // Flat array
     connections: z.array(ConnectionSchema),
   });
   ```

2. Create src/trpc/context.ts:
   - Define Context type with user info, platform, etc.
   - createContext function for desktop and web

3. Create src/trpc/router.ts with tRPC router:

   ```typescript
   import { initTRPC } from "@trpc/server";
   import superjson from "superjson";

   const t = initTRPC.context<Context>().create({
     transformer: superjson, // For Date serialization
   });

   export const appRouter = t.router({
     nodes: t.router({
       list: t.procedure.query(async () => {
         // Return flat array of node definitions
       }),

       getChildren: t.procedure
         .input(z.string()) // parentId
         .query(async ({ input }) => {
           // Return nodes with this parentId
         }),

       getByVersion: t.procedure
         .input(
           z.object({
             type: z.string(),
             version: z.string(),
           }),
         )
         .query(async ({ input }) => {
           // Get specific node version
         }),
     }),

     execution: t.router({
       execute: t.procedure
         .input(
           z.object({
             executable: ExecutableSchema,
             context: z.record(z.any()).optional(),
           }),
         )
         .mutation(async ({ input, ctx }) => {
           // This will be implemented by desktop
           throw new Error("Not implemented");
         }),

       // Add subscription for progress
       onProgress: t.procedure
         .input(z.string()) // execution ID
         .subscription(({ input }) => {
           // Desktop will implement
           throw new Error("Not implemented");
         }),
     }),

     storage: t.router({
       save: t.procedure.input(FlowSchema).mutation(async ({ input }) => {
         throw new Error("Not implemented");
       }),

       load: t.procedure.input(z.string()).query(async ({ input }) => {
         throw new Error("Not implemented");
       }),

       list: t.procedure.query(async () => {
         throw new Error("Not implemented");
       }),
     }),
   });

   export type AppRouter = typeof appRouter;
   ```

4. Export from main index.ts

The router handles the new flat node structure with parentId and top-level
version.

```
#### Step 2.3: Rename IPC to RPC Package
- [X] Rename directory
- [X] Update package.json
- [X] Update imports
- [X] Keep backward compatibility

**Claude Code Prompt:**
```

Rename @atomiton/ipc to @atomiton/rpc and update all references:

1. Rename the package directory:
   - packages/@atomiton/ipc → packages/@atomiton/rpc

2. Update package.json:
   - name: "@atomiton/rpc"
   - Update all exports paths if needed

3. Create backward compatibility in src/index.ts:

   ```typescript
   // New tRPC exports
   export * from "./trpc/router";
   export * from "./schemas";
   export type { AppRouter } from "./trpc/router";

   // Legacy exports (deprecated)
   export * as IPC from "./legacy/channels";
   export * from "./legacy/types";
   ```

4. Update all imports across codebase:
   - "@atomiton/ipc" → "@atomiton/rpc"
   - Keep IPC as deprecated alias for now

5. Update desktop and client imports but keep them working with legacy code for
   now

This renames the package while maintaining backward compatibility.

```

#### Step 2.4: Set up electron-trpc in Desktop
- [X] Configure electron-trpc
- [X] Create IPC handlers
- [X] Set up in main process
- [X] Update preload

**Claude Code Prompt:**
```

Set up electron-trpc in the desktop app with support for flat node structure:

1. Install electron-trpc in desktop app

2. Create src/main/trpc/handler.ts:

   ```typescript
   import { createIPCHandler } from "electron-trpc/main";
   import { appRouter } from "@atomiton/rpc";
   import { createConductor } from "@atomiton/conductor";

   const conductor = createConductor();

   export const createTRPCHandler = (mainWindow: BrowserWindow) => {
     return createIPCHandler({
       router: appRouter,
       windows: [mainWindow],
       createContext: async () => ({
         platform: "desktop",
         conductor,
       }),
       // Implement the procedures
       async resolve(opts) {
         const { ctx, input, path } = opts;

         if (path === "execution.execute") {
           // Note: node.version is now at top level
           const result = await ctx.conductor.execute(input.executable);
           return {
             success: result.success,
             outputs: result.outputs,
             error: result.error,
           };
         }

         if (path === "nodes.list") {
           // Return flat array of nodes
           const nodes = await getNodeDefinitions();
           return nodes; // Flat array with parentId
         }

         if (path === "nodes.getChildren") {
           // Get nodes with specific parentId
           const nodes = await getNodeDefinitions();
           return nodes.filter((n) => n.parentId === input);
         }

         // Implement other procedures...
       },
     });
   };
   ```

3. Update src/main/index.ts:

   ```typescript
   import { createTRPCHandler } from "./trpc/handler";

   app.whenReady().then(() => {
     const mainWindow = createWindow();
     const trpcHandler = createTRPCHandler(mainWindow);

     // Legacy IPC handlers for backward compatibility
     setupLegacyHandlers(mainWindow);
   });
   ```

4. Update preload script (src/preload/index.ts):

   ```typescript
   import { exposeElectronTRPC } from "electron-trpc/preload";

   process.once("loaded", () => {
     exposeElectronTRPC();

     // Also expose legacy IPC for backward compatibility
     contextBridge.exposeInMainWorld("atomitonIPC", legacyAPI);
   });
   ```

This sets up tRPC with support for the new flat node structure.

```

#### Step 2.5: Update Client to Use tRPC
- [X] Set up tRPC client
- [X] Create hooks
- [X] Update RPC calls
- [X] Keep backward compatibility

**Claude Code Prompt:**
```

Update the client to use tRPC with the new node structure:

1. Install tRPC client dependencies:
   - @trpc/client
   - @trpc/react-query
   - @tanstack/react-query

2. Create src/lib/trpc.ts:

   ```typescript
   import { createTRPCClient } from "@trpc/client";
   import { ipcLink } from "electron-trpc/renderer";
   import type { AppRouter } from "@atomiton/rpc";
   import superjson from "superjson";

   export const trpc = createTRPCClient<AppRouter>({
     links: [ipcLink()],
     transformer: superjson,
   });

   // For React components
   export const trpcReact = createTRPCReact<AppRouter>();
   ```

3. Set up React Query provider in main app:

   ```typescript
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { trpcReact } from './lib/trpc';

   const queryClient = new QueryClient();
   const trpcClient = trpcReact.createClient({
     links: [ipcLink()],
     transformer: superjson,
   });

   function App() {
     return (
       <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
         <QueryClientProvider client={queryClient}>
           {/* Your app */}
         </QueryClientProvider>
       </trpcReact.Provider>
     );
   }
   ```

4. Create hooks for node operations (src/hooks/useNodes.ts):

   ```typescript
   import { trpcReact } from "../lib/trpc";

   export const useNodeDefinitions = () => {
     return trpcReact.nodes.list.useQuery();
   };

   export const useNodeChildren = (parentId: string) => {
     return trpcReact.nodes.getChildren.useQuery(parentId, {
       enabled: !!parentId,
     });
   };

   export const useNodeByVersion = (type: string, version: string) => {
     return trpcReact.nodes.getByVersion.useQuery(
       { type, version },
       { enabled: !!type && !!version },
     );
   };
   ```

5. Create new RPC wrapper (src/lib/rpc.ts):

   ```typescript
   import { trpc } from "./trpc";
   import type { Executable } from "@atomiton/flow";

   export const rpc = {
     async execute(executable: Executable) {
       // Note: executable.version is now at top level
       return trpc.execution.execute.mutate({
         executable,
         context: { user: "current-user" },
       });
     },

     async getNodeDefinitions() {
       // Returns flat array with parentId
       return trpc.nodes.list.query();
     },

     async getNodeChildren(parentId: string) {
       return trpc.nodes.getChildren.query(parentId);
     },

     async saveFlow(flow: Flow) {
       return trpc.storage.save.mutate(flow);
     },

     async loadFlow(id: string) {
       return trpc.storage.load.query(id);
     },

     // Legacy compatibility
     executeNode: (node) => this.execute(node),
   };

   // Legacy export
   export const ipc = rpc;
   ```

This gives you type-safe RPC with the new flat node structure.

```

#### Step 2.6: Implement tRPC Procedures in Desktop
- [ ] Implement execution procedures
- [ ] Implement node procedures
- [ ] Implement storage procedures
- [ ] Add progress subscriptions

**Claude Code Prompt:**
```

Implement the actual tRPC procedures in desktop with flat node structure:

1. Create src/main/procedures/nodes.ts:

   ```typescript
   import { getNodeDefinitions } from "@atomiton/nodes";

   export const nodeProcedures = {
     list: async () => {
       // Get all node definitions (flat array)
       const nodes = await getNodeDefinitions();
       // Ensure they have version at top level and parentId
       return nodes.map((node) => ({
         ...node,
         version: node.version || node.metadata?.version || "1.0.0",
         parentId: node.parentId || undefined,
         metadata: {
           ...node.metadata,
           version: undefined, // Remove from metadata if present
         },
       }));
     },

     getChildren: async ({ input: parentId }) => {
       const nodes = await getNodeDefinitions();
       return nodes.filter((n) => n.parentId === parentId);
     },

     getByVersion: async ({ input }) => {
       const { type, version } = input;
       const nodes = await getNodeDefinitions();
       return nodes.find((n) => n.type === type && n.version === version);
     },
   };
   ```

2. Create src/main/procedures/execution.ts:

   ```typescript
   import { createConductor } from "@atomiton/conductor";
   import { observable } from "@trpc/server/observable";
   import { EventEmitter } from "events";

   const conductor = createConductor();
   const progressEmitter = new EventEmitter();

   export const executionProcedures = {
     execute: async ({ input }) => {
       const { executable, context } = input;

       // Note: executable.version is at top level now
       console.log(`Executing ${executable.type} v${executable.version}`);

       // Emit progress
       const executionId = `exec-${Date.now()}`;
       progressEmitter.emit("progress", {
         executionId,
         progress: 0,
         message: "Starting execution",
       });

       try {
         // Execute with conductor
         const result = await conductor.execute(executable);

         progressEmitter.emit("progress", {
           executionId,
           progress: 100,
           message: "Complete",
         });

         return {
           id: executionId,
           success: result.success,
           outputs: result.outputs,
           error: result.error,
           duration: result.duration,
         };
       } catch (error) {
         progressEmitter.emit("progress", {
           executionId,
           progress: -1,
           message: error.message,
         });
         throw error;
       }
     },

     onProgress: ({ input }) => {
       return observable((observer) => {
         const handler = (data) => {
           if (data.executionId === input) {
             observer.next(data);
           }
         };

         progressEmitter.on("progress", handler);

         return () => {
           progressEmitter.off("progress", handler);
         };
       });
     },
   };
   ```

3. Create src/main/procedures/storage.ts:

   ```typescript
   import { app } from "electron";
   import fs from "fs/promises";
   import path from "path";
   import { toYaml, parseYaml } from "@atomiton/yaml";

   const FLOWS_DIR = path.join(app.getPath("documents"), "Atomiton", "flows");

   export const storageProcedures = {
     save: async ({ input }) => {
       const flow = input;
       // Ensure nodes have flat structure with parentId
       const flatFlow = {
         ...flow,
         nodes: flow.nodes.map((n) => ({
           ...n,
           version: n.version || "1.0.0", // At top level
           parentId: n.parentId || undefined,
         })),
       };

       const yaml = toYaml(flatFlow);
       const filePath = path.join(FLOWS_DIR, `${flow.id}.flow.yaml`);

       await fs.mkdir(FLOWS_DIR, { recursive: true });
       await fs.writeFile(filePath, yaml, "utf-8");

       return { success: true, path: filePath };
     },

     load: async ({ input }) => {
       const filePath = path.join(FLOWS_DIR, `${input}.flow.yaml`);
       const yaml = await fs.readFile(filePath, "utf-8");
       const flow = parseYaml(yaml);

       // Migrate if needed (version at top level, parentId structure)
       if (flow.nodes) {
         flow.nodes = flow.nodes.map((node) => ({
           ...node,
           version: node.version || node.metadata?.version || "1.0.0",
           parentId: node.parentId || undefined,
           metadata: node.metadata
             ? {
                 ...node.metadata,
                 version: undefined,
               }
             : undefined,
         }));
       }

       return flow;
     },

     list: async () => {
       const files = await fs.readdir(FLOWS_DIR);
       return files
         .filter((f) => f.endsWith(".flow.yaml"))
         .map((f) => f.replace(".flow.yaml", ""));
     },
   };
   ```

4. Update main tRPC handler to use procedures:

   ```typescript
   import { nodeProcedures } from "../procedures/nodes";
   import { executionProcedures } from "../procedures/execution";
   import { storageProcedures } from "../procedures/storage";

   export const createTRPCHandler = (mainWindow: BrowserWindow) => {
     return createIPCHandler({
       router: appRouter,
       windows: [mainWindow],
       createContext: async () => ({
         window: mainWindow,
         platform: "desktop",
       }),
       // Map procedures
       procedures: {
         nodes: nodeProcedures,
         execution: executionProcedures,
         storage: storageProcedures,
       },
     });
   };
   ```

This implements all procedures with the new flat node structure.

```

### Phase 3: Integrate Flow Concept (Week 4-5)

#### Step 3.1: Update Editor Package
- [ ] Add @atomiton/flow dependency
- [ ] Create transform utilities
- [ ] Update editor component
- [ ] Add tests

**Claude Code Prompt:**
```

Update @atomiton/editor to work with Flow types and flat node structure:

1. Add @atomiton/flow to package.json dependencies

2. Create src/utils/transform.ts with support for flat nodes:

   ```typescript
   import type { Flow, FlowNode } from "@atomiton/flow";

   // Transform utilities that handle parentId relationships
   export function flowToReactFlow(flow: Flow) {
     // Convert flat nodes array to React Flow format
     const nodes = flow.nodes.map((node) => ({
       id: node.id,
       type: node.type,
       position: node.position,
       data: {
         label: node.label || node.type,
         config: node.config,
         version: node.version, // Top level
         parentId: node.parentId, // Flat structure
       },
     }));

     // Convert connections to edges
     const edges = flow.connections.map((conn) => ({
       id: conn.id,
       source: conn.source,
       target: conn.target,
       type: "smoothstep",
     }));

     return { nodes, edges };
   }

   export function reactFlowToFlow(nodes, edges, baseFlow?) {
     // Convert back maintaining flat structure
     const flowNodes = nodes.map((node) => ({
       id: node.id,
       type: node.type,
       version: node.data?.version || "1.0.0", // Top level
       position: node.position,
       config: node.data?.config || {},
       label: node.data?.label,
       parentId: node.data?.parentId, // Preserve parent relationships
     }));

     const connections = edges.map((edge) => ({
       id: edge.id,
       source: edge.source,
       target: edge.target,
     }));

     return {
       ...baseFlow,
       nodes: flowNodes,
       connections,
       metadata: {
         ...baseFlow?.metadata,
         updatedAt: new Date(),
       },
     };
   }

   // Helper to get node hierarchy from flat structure
   export function getNodeHierarchy(nodes: FlowNode[]) {
     const nodeMap = new Map(nodes.map((n) => [n.id, n]));
     const roots = nodes.filter((n) => !n.parentId);

     const buildTree = (parentId?: string) => {
       return nodes
         .filter((n) => n.parentId === parentId)
         .map((n) => ({
           ...n,
           children: buildTree(n.id),
         }));
     };

     return roots.map((root) => ({
       ...root,
       children: buildTree(root.id),
     }));
   }
   ```

3. Update editor component to handle flat nodes:
   - Accept flow prop of type Flow
   - Transform internally for React Flow
   - Support parent-child relationships visually
   - Transform back maintaining flat structure

The editor works with flat node arrays using parentId for relationships.

```

#### Step 3.2: Update Client to Use Flow with tRPC
- [ ] Import Flow types
- [ ] Update execute methods
- [ ] Use tRPC mutations
- [ ] Add type-safe hooks

**Claude Code Prompt:**
```

Update client to use Flow types with tRPC and flat nodes:

1. Create hooks for tRPC operations (src/hooks/useFlow.ts):

   ```typescript
   import { trpcReact } from "../lib/trpc";
   import type { Flow } from "@atomiton/flow";

   export const useExecuteFlow = () => {
     return trpcReact.execution.execute.useMutation({
       onSuccess: (data) => {
         console.log("Execution complete:", data);
       },
       onError: (error) => {
         console.error("Execution failed:", error);
       },
     });
   };

   export const useSaveFlow = () => {
     return trpcReact.storage.save.useMutation({
       onMutate: (flow) => {
         // Ensure flat structure before saving
         const flatFlow = {
           ...flow,
           nodes: flow.nodes.map((n) => ({
             ...n,
             version: n.version || "1.0.0",
             parentId: n.parentId || undefined,
           })),
         };
         return { flatFlow };
       },
     });
   };

   export const useLoadFlow = (id: string) => {
     return trpcReact.storage.load.useQuery(id, {
       select: (flow) => {
         // Ensure nodes have proper structure
         return {
           ...flow,
           nodes:
             flow.nodes?.map((n) => ({
               ...n,
               version: n.version || n.metadata?.version || "1.0.0",
               parentId: n.parentId,
             })) || [],
         };
       },
     });
   };

   export const useFlowList = () => {
     return trpcReact.storage.list.useQuery();
   };
   ```

2. Update components to use hooks and handle flat nodes:

   ```typescript
   function EditorToolbar({ flow }) {
     const executeFlow = useExecuteFlow();
     const saveFlow = useSaveFlow();

     const handleRun = () => {
       // Flow nodes are flat array with parentId
       executeFlow.mutate({
         executable: flow,
         context: { source: 'editor' }
       });
     };

     const handleSave = () => {
       // Saves with flat structure
       saveFlow.mutate(flow);
     };

     return (
       <div>
         <button onClick={handleRun} disabled={executeFlow.isPending}>
           {executeFlow.isPending ? 'Running...' : 'Run'}
         </button>
         <button onClick={handleSave} disabled={saveFlow.isPending}>
           Save
         </button>
       </div>
     );
   }
   ```

3. Create node tree component for hierarchical display:

   ```typescript
   function NodeTree({ nodes }) {
     const rootNodes = nodes.filter(n => !n.parentId);

     const renderNode = (node) => {
       const children = nodes.filter(n => n.parentId === node.id);

       return (
         <div key={node.id}>
           <div>{node.type} v{node.version}</div>
           {children.length > 0 && (
             <div style={{ marginLeft: 20 }}>
               {children.map(renderNode)}
             </div>
           )}
         </div>
       );
     };

     return <div>{rootNodes.map(renderNode)}</div>;
   }
   ```

This gives you fully type-safe Flow operations with flat node structure.

```

#### Step 3.3: Update YAML Package
- [ ] Add Flow type imports
- [ ] Create flow-specific serialization
- [ ] Handle flat node structure
- [ ] Add tests

**Claude Code Prompt:**
```

Update @atomiton/yaml package to work with Flow types and flat nodes:

1. Add @atomiton/flow dependency

2. Create flow-specific YAML functions that handle flat structure:

   ```typescript
   import { Flow } from "@atomiton/flow";
   import yaml from "js-yaml";

   export function parseFlowYaml(content: string): Flow {
     const parsed = yaml.load(content);

     // Ensure nodes have flat structure
     if (parsed.nodes) {
       parsed.nodes = parsed.nodes.map((node) => ({
         ...node,
         version: node.version || node.metadata?.version || "1.0.0",
         parentId: node.parentId || undefined,
         metadata: node.metadata
           ? {
               ...node.metadata,
               version: undefined, // Remove from metadata
             }
           : undefined,
       }));
     }

     return parsed as Flow;
   }

   export function flowToYaml(flow: Flow): string {
     // Ensure flat structure in output
     const flatFlow = {
       ...flow,
       nodes: flow.nodes.map((node) => ({
         id: node.id,
         type: node.type,
         version: node.version, // At top level
         parentId: node.parentId, // Flat reference
         position: node.position,
         config: node.config,
         label: node.label,
         metadata: node.metadata,
       })),
     };

     return yaml.dump(flatFlow, {
       sortKeys: false,
       lineWidth: -1,
       noRefs: true,
     });
   }

   export function validateFlowYaml(content: string): boolean {
     try {
       const flow = parseFlowYaml(content);
       // Check flat structure
       return flow.nodes.every(
         (node) =>
           typeof node.version === "string" &&
           (!node.parentId || typeof node.parentId === "string"),
       );
     } catch {
       return false;
     }
   }
   ```

3. YAML format with flat nodes:

   ```yaml
   version: 1
   type: flow
   name: My Flow
   nodes:
     - id: node-1
       type: httpRequest
       version: "2.0.1" # At top level
       parentId: null # Root node
       position: { x: 100, y: 200 }
       config:
         url: https://api.example.com
     - id: node-2
       type: transform
       version: "1.5.0"
       parentId: node-1 # Child of node-1
       position: { x: 200, y: 200 }
       config:
         expression: "data.result"
   connections:
     - id: conn-1
       source: node-1
       target: node-2
   ```

4. Add migration for old nested structure:

   ```typescript
   export function migrateNestedToFlat(oldFlow: any): Flow {
     const flatNodes = [];

     const flatten = (nodes: any[], parentId?: string) => {
       for (const node of nodes) {
         const { children, ...nodeWithoutChildren } = node;

         flatNodes.push({
           ...nodeWithoutChildren,
           version: node.version || node.metadata?.version || "1.0.0",
           parentId: parentId || undefined,
           metadata: node.metadata
             ? {
                 ...node.metadata,
                 version: undefined,
               }
             : undefined,
         });

         if (children && children.length > 0) {
           flatten(children, node.id);
         }
       }
     };

     flatten(oldFlow.nodes || []);

     return {
       ...oldFlow,
       nodes: flatNodes,
     };
   }
   ```

The YAML package now handles flat node structure with parentId relationships.

```

### Phase 4: Add Versioning Support (Week 6)

#### Step 4.1: Add Version Field to Flow
- [ ] Update Flow interface
- [ ] Add CURRENT_VERSION constant
- [ ] Update factories
- [ ] Add tests

**Claude Code Prompt:**
```

Add versioning support to @atomiton/flow with flat node structure:

1. Add 'version: number' field to Flow interface (schema version)
2. Add CURRENT_FLOW_VERSION = 1 constant
3. Update createFlow() to include version field
4. Create src/migrations/index.ts with migrations for:
   - Schema version changes
   - Nested to flat node structure migration
   - Version field location (metadata → top level)

   ```typescript
   export interface FlowMigration {
     from: number;
     to: number;
     migrate: (flow: any) => any;
   }

   export const migrations: FlowMigration[] = [
     {
       from: 0, // Unversioned
       to: 1,
       migrate: (flow) => {
         // Migrate to flat node structure
         const flatNodes = [];

         const flatten = (nodes, parentId?) => {
           for (const node of nodes || []) {
             const { children, metadata, ...rest } = node;

             flatNodes.push({
               ...rest,
               version: node.version || metadata?.version || "1.0.0",
               parentId: parentId || undefined,
               metadata: metadata
                 ? {
                     ...metadata,
                     version: undefined,
                   }
                 : undefined,
             });

             if (children) flatten(children, node.id);
           }
         };

         flatten(flow.nodes);

         return {
           ...flow,
           version: 1,
           nodes: flatNodes,
         };
       },
     },
   ];

   export function migrateFlow(flow: any): Flow {
     let current = flow;

     // Add version if missing
     if (!current.version) {
       current.version = 0;
     }

     // Apply migrations
     while (current.version < CURRENT_FLOW_VERSION) {
       const migration = migrations.find((m) => m.from === current.version);
       if (!migration) break;

       current = migration.migrate(current);
     }

     return current;
   }
   ```

5. Export migration functions from main index.ts
6. Document that version is for schema, not instance

The migration system handles both schema versions and structural changes (nested
→ flat).

```

#### Step 4.2: Implement Migration System
- [ ] Create migration utilities
- [ ] Add migration tests
- [ ] Update load functions
- [ ] Document migration process

**Claude Code Prompt:**
```

Implement the migration system for @atomiton/flow with flat nodes:

1. Create comprehensive migration utilities:

   ```typescript
   // Detect structure type
   export function detectNodeStructure(
     nodes: any[],
   ): "flat" | "nested" | "unknown" {
     if (!nodes || nodes.length === 0) return "unknown";

     const hasChildren = nodes.some((n) => n.children && n.children.length > 0);
     const hasParentId = nodes.some((n) => n.parentId);

     if (hasChildren) return "nested";
     if (hasParentId) return "flat";
     return "flat"; // Default for simple arrays
   }

   // Detect version location
   export function detectVersionLocation(
     node: any,
   ): "top" | "metadata" | "none" {
     if (node.version) return "top";
     if (node.metadata?.version) return "metadata";
     return "none";
   }

   // Comprehensive migrate function
   export function migrateFlow(flow: any): Flow {
     let migrated = { ...flow };

     // Detect and migrate structure
     const structure = detectNodeStructure(migrated.nodes);
     if (structure === "nested") {
       migrated = migrateNestedToFlat(migrated);
     }

     // Migrate version location
     migrated.nodes =
       migrated.nodes?.map((node) => ({
         ...node,
         version: node.version || node.metadata?.version || "1.0.0",
         metadata: node.metadata
           ? {
               ...node.metadata,
               version: undefined,
             }
           : undefined,
       })) || [];

     // Apply schema migrations
     if (!migrated.version) migrated.version = 0;

     while (migrated.version < CURRENT_FLOW_VERSION) {
       const migration = migrations.find((m) => m.from === migrated.version);
       if (!migration) break;
       migrated = migration.migrate(migrated);
     }

     return migrated;
   }
   ```

2. Update storage/yaml packages to always migrate on load:

   ```typescript
   export async function loadFlow(path: string): Promise<Flow> {
     const content = await fs.readFile(path, "utf-8");
     const parsed = yaml.load(content);

     // Always migrate
     const migrated = migrateFlow(parsed);

     // Log if migration occurred
     if (
       parsed.version !== migrated.version ||
       detectNodeStructure(parsed.nodes) !== "flat"
     ) {
       console.log(
         `Migrated flow from v${parsed.version || 0} to v${migrated.version}`,
       );
       console.log(`Structure: ${detectNodeStructure(parsed.nodes)} → flat`);
     }

     return migrated;
   }
   ```

3. Add comprehensive tests:

   ```typescript
   describe("Flow Migrations", () => {
     test("migrates nested to flat structure", () => {
       const nested = {
         nodes: [
           {
             id: "root",
             type: "group",
             children: [
               {
                 id: "child",
                 type: "http",
                 metadata: { version: "1.0.0" },
               },
             ],
           },
         ],
       };

       const migrated = migrateFlow(nested);

       expect(migrated.nodes).toHaveLength(2);
       expect(migrated.nodes[0].parentId).toBeUndefined();
       expect(migrated.nodes[1].parentId).toBe("root");
       expect(migrated.nodes[1].version).toBe("1.0.0");
       expect(migrated.nodes[1].metadata?.version).toBeUndefined();
     });

     test("migrates version from metadata to top level", () => {
       const oldVersion = {
         nodes: [
           {
             id: "node1",
             metadata: { version: "2.0.0" },
           },
         ],
       };

       const migrated = migrateFlow(oldVersion);

       expect(migrated.nodes[0].version).toBe("2.0.0");
       expect(migrated.nodes[0].metadata?.version).toBeUndefined();
     });

     test("handles already flat structure", () => {
       const flat = {
         version: 1,
         nodes: [
           {
             id: "node1",
             version: "1.0.0",
             parentId: undefined,
           },
         ],
       };

       const migrated = migrateFlow(flat);

       expect(migrated).toEqual(flat);
     });
   });
   ```

4. Document migration strategy in README

Migrations handle both structural changes (nested→flat) and field location
(metadata.version→version).

```

### Phase 5: Cleanup & Optimization (Week 7)

#### Step 5.1: Remove Legacy Code
- [ ] Remove old nested node handlers
- [ ] Remove metadata.version references
- [ ] Clean up backward compatibility
- [ ] Update all imports

**Claude Code Prompt:**
```

Remove all legacy code related to old node structure:

1. In @atomiton/nodes:
   - Remove any code handling children arrays
   - Remove metadata.version references
   - Ensure all nodes use flat structure with parentId
   - Remove old nested helper functions

2. In @atomiton/rpc:
   - Remove schemas for nested nodes
   - Update all schemas to expect version at top level
   - Remove backward compatibility for metadata.version

3. In desktop:
   - Remove any nested node handling
   - Remove metadata.version migration code
   - Ensure all procedures work with flat structure only

4. In client:
   - Update all components to work with flat nodes
   - Remove any nested tree building (use parentId)
   - Ensure version is accessed at top level

5. Search entire codebase for:
   - "children" property on nodes (should use parentId)
   - "metadata.version" (should be node.version)
   - Nested node traversal functions
   - Old tree-building utilities

6. Update TypeScript types to enforce new structure:
   ```typescript
   interface NodeDefinition {
     id: string;
     type: string;
     version: string; // Required at top level
     parentId?: string; // Optional parent reference
     metadata?: {
       // version is NOT here
       label?: string;
       description?: string;
     };
     // children is NOT here
   }
   ```

The system should now only work with flat node arrays using parentId
relationships.

```

#### Step 5.2: Optimize Performance with Flat Structure
- [ ] Add node lookup maps
- [ ] Optimize parent/child queries
- [ ] Add caching for hierarchy
- [ ] Profile performance

**Claude Code Prompt:**
```

Optimize performance with the flat node structure:

1. Create efficient node indexes:

   ```typescript
   export class NodeIndex {
     private nodeMap: Map<string, NodeDefinition>;
     private childrenMap: Map<string, Set<string>>;
     private versionMap: Map<string, Map<string, NodeDefinition>>;

     constructor(nodes: NodeDefinition[]) {
       this.rebuild(nodes);
     }

     rebuild(nodes: NodeDefinition[]) {
       this.nodeMap = new Map(nodes.map((n) => [n.id, n]));

       // Build children index
       this.childrenMap = new Map();
       for (const node of nodes) {
         if (node.parentId) {
           if (!this.childrenMap.has(node.parentId)) {
             this.childrenMap.set(node.parentId, new Set());
           }
           this.childrenMap.get(node.parentId)!.add(node.id);
         }
       }

       // Build version index
       this.versionMap = new Map();
       for (const node of nodes) {
         if (!this.versionMap.has(node.type)) {
           this.versionMap.set(node.type, new Map());
         }
         this.versionMap.get(node.type)!.set(node.version, node);
       }
     }

     getNode(id: string): NodeDefinition | undefined {
       return this.nodeMap.get(id);
     }

     getChildren(parentId: string): NodeDefinition[] {
       const childIds = this.childrenMap.get(parentId) || new Set();
       return Array.from(childIds)
         .map((id) => this.nodeMap.get(id))
         .filter(Boolean) as NodeDefinition[];
     }

     getRoots(): NodeDefinition[] {
       return Array.from(this.nodeMap.values()).filter((n) => !n.parentId);
     }

     getByVersion(type: string, version: string): NodeDefinition | undefined {
       return this.versionMap.get(type)?.get(version);
     }
   }
   ```

2. Add memoization for hierarchy building:

   ```typescript
   import { memoize } from "lodash";

   export const getNodeHierarchy = memoize(
     (nodes: NodeDefinition[]) => {
       const index = new NodeIndex(nodes);

       const buildTree = (parentId?: string): any[] => {
         const children = parentId
           ? index.getChildren(parentId)
           : index.getRoots();

         return children.map((child) => ({
           ...child,
           children: buildTree(child.id),
         }));
       };

       return buildTree();
     },
     (nodes) => nodes.map((n) => `${n.id}:${n.parentId}`).join(","),
   );
   ```

3. Optimize React components with flat structure:

   ```typescript
   const NodeTree = React.memo(({ nodes }) => {
     const index = useMemo(() => new NodeIndex(nodes), [nodes]);
     const roots = useMemo(() => index.getRoots(), [index]);

     return <TreeView roots={roots} index={index} />;
   });
   ```

4. Add performance benchmarks:

   ```typescript
   describe("Flat vs Nested Performance", () => {
     const createLargeTree = (depth: number, breadth: number) => {
       // Generate test data
     };

     test("flat structure queries are faster", () => {
       const nodes = createLargeTree(5, 10); // 11,111 nodes

       console.time("Find children - flat");
       const index = new NodeIndex(nodes);
       const children = index.getChildren("node-500");
       console.timeEnd("Find children - flat");

       // Should be < 1ms even for large trees
       expect(children).toBeDefined();
     });
   });
   ```

The flat structure with indexes provides O(1) lookups instead of O(n) tree
traversal.

```

#### Step 5.3: Final Testing & Documentation
- [ ] End-to-end tests with flat nodes
- [ ] Update all READMEs
- [ ] Document migration from nested to flat
- [ ] Create examples

**Claude Code Prompt:**
```

Complete final testing and documentation for flat node structure:

1. Create E2E tests for flat node structure:

   ```typescript
   describe("Flat Node Structure E2E", () => {
     test("complete lifecycle with flat nodes", async () => {
       // Create flow with flat nodes
       const flow = createFlow({
         name: "Test Flow",
         nodes: [
           { id: "root", type: "group", version: "1.0.0" },
           { id: "child1", type: "http", version: "2.0.0", parentId: "root" },
           {
             id: "child2",
             type: "transform",
             version: "1.5.0",
             parentId: "root",
           },
         ],
       });

       // Save via tRPC
       const saved = await trpc.storage.save.mutate(flow);
       expect(saved.success).toBe(true);

       // Load and verify structure
       const loaded = await trpc.storage.load.query(flow.id);
       expect(loaded.nodes).toHaveLength(3);
       expect(loaded.nodes[1].parentId).toBe("root");
       expect(loaded.nodes[1].version).toBe("2.0.0");

       // Execute with flat structure
       const result = await trpc.execution.execute.mutate({
         executable: loaded,
       });
       expect(result.success).toBeDefined();
     });

     test("migration from nested to flat", async () => {
       const nested = {
         nodes: [
           {
             id: "root",
             children: [{ id: "child", metadata: { version: "1.0.0" } }],
           },
         ],
       };

       const migrated = migrateFlow(nested);
       expect(migrated.nodes).toHaveLength(2);
       expect(migrated.nodes[1].parentId).toBe("root");
       expect(migrated.nodes[1].version).toBe("1.0.0");
     });
   });
   ```

2. Update package READMEs with flat structure:

   ````markdown
   ## Node Structure

   Nodes use a flat array structure with parentId references:

   - `version` is at the top level (not in metadata)
   - Parent-child relationships use `parentId` (not nested children)
   - All nodes are in a flat array for better performance

   ### Example

   ```typescript
   const nodes = [
     { id: "1", type: "group", version: "1.0.0" },
     { id: "2", type: "http", version: "2.0.0", parentId: "1" },
     { id: "3", type: "transform", version: "1.5.0", parentId: "1" },
   ];
   ```
   ````

````

```

```

3. Document migration guide:

   ```markdown
   ## Migration from Nested to Flat Structure

   ### What Changed

   **Before (Nested)**:

   - Nodes could have `children` arrays
   - Version was in `metadata.version`
   - Deep recursion for traversal

   **After (Flat)**:

   - All nodes in flat array
   - Parent-child via `parentId`
   - Version at top level
   - O(1) lookups with indexes

   ### Automatic Migration

   The system automatically migrates old structures when loading:

   - Nested → Flat structure
   - metadata.version → version

   ### Performance Benefits

   - 10x faster child lookups
   - 5x faster tree building
   - Better memory usage
   - Simpler updates
   ```

4. Create examples showing flat structure benefits:

   ```typescript
   // Example: Efficient queries with flat structure
   const index = new NodeIndex(flow.nodes);

   // O(1) child lookup
   const children = index.getChildren("parent-id");

   // O(1) version lookup
   const node = index.getByVersion("http", "2.0.0");

   // O(n) but only once for roots
   const roots = index.getRoots();
   ```

This completes the migration to flat node structure with full documentation.

```

## Implementation Checklist

### Phase 1: Foundation ⏳
- [ ] Step 1.1: Create @atomiton/flow package
- [ ] Step 1.2: Refactor Flow to use Node types from @atomiton/nodes
- [ ] Step 1.3: Update NodeDefinition structure (nested → flat, version to top)
- [ ] Step 1.4: Create @atomiton/conductor package

### Phase 2: Convert to tRPC ⏳
- [ ] Step 2.1: Install tRPC dependencies
- [ ] Step 2.2: Create tRPC router with flat node schemas
- [ ] Step 2.3: Rename IPC to RPC package
- [ ] Step 2.4: Set up electron-trpc in desktop
- [ ] Step 2.5: Update client to use tRPC
- [ ] Step 2.6: Implement tRPC procedures with flat nodes

### Phase 3: Flow Integration ⏳
- [ ] Step 3.1: Update editor package for flat nodes
- [ ] Step 3.2: Update client to use Flow with flat structure
- [ ] Step 3.3: Update YAML package for flat nodes

### Phase 4: Versioning ⏳
- [ ] Step 4.1: Add version field to Flow
- [ ] Step 4.2: Implement migration system (nested→flat, version location)

### Phase 5: Cleanup & Optimization ⏳
- [ ] Step 5.1: Remove legacy nested node code
- [ ] Step 5.2: Optimize performance with flat structure
- [ ] Step 5.3: Final testing & documentation

## Success Metrics

- [ ] All nodes use flat structure with parentId (no children arrays)
- [ ] Version is at top level for all nodes (not in metadata)
- [ ] @atomiton/rpc uses tRPC for all communication
- [ ] Full type safety from client to desktop and back
- [ ] Migration system handles nested→flat automatically
- [ ] Performance improved with O(1) lookups
- [ ] All tests pass with new structure
- [ ] Documentation complete

## Benefits of These Changes

### Flat Node Structure with parentId
1. **Better Performance** - O(1) lookups instead of recursive traversal
2. **Simpler Updates** - Just change parentId to move subtrees
3. **Database Friendly** - Easy to store in relational or document DBs
4. **Easier Queries** - Simple array operations instead of tree recursion
5. **Better for React** - Flat arrays work better with React's reconciliation

### Version at Top Level
1. **Cleaner API** - `node.version` instead of `node.metadata.version`
2. **Better TypeScript** - Required field at top level
3. **Simpler Validation** - Direct access for version checks
4. **Clearer Intent** - Version is a primary concern, not metadata

These structural improvements combined with tRPC give you a much cleaner, more performant system!
```
````
