# Domain Ownership Summary

## Quick Reference Matrix

| Concept                   | Owner Package         | Why                              | What It Owns                                                                                                  | What It Doesn't Own                                                     |
| ------------------------- | --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Executable Type**       | `@atomiton/flow`      | Base interface for all execution | • Executable interface<br>• Flow (composite node)<br>• FlowNode (single node)<br>• Connection types           | • Execution logic<br>• Visual representation<br>• Transport concerns    |
| **Node Implementations**  | `@atomiton/nodes`     | Domain-specific node logic       | • NodeDefinition<br>• NodeSchema<br>• NodeExecutable<br>• Node validation                                     | • Flow structure<br>• Execution orchestration<br>• Visual components    |
| **Universal Execution**   | `@atomiton/conductor` | Executes any Executable          | • execute(executable) function<br>• ExecutionResult type<br>• ExecutionContext<br>• Execution strategies      | • Transport/RPC<br>• Type definitions<br>• Visual representation        |
| **Visual Transform**      | `@atomiton/editor`    | Visualization concerns           | • flowToReactFlow()<br>• reactFlowToFlow()<br>• Node visual components<br>• Transform utilities               | • Executable types<br>• Execution logic<br>• Persistence                |
| **Transport Layer**       | `@atomiton/rpc`       | Remote procedure calls           | • ExecuteRequest type<br>• ExecuteResponse type<br>• Progress updates<br>• Channel definitions                | • Execution logic<br>• Executable types<br>• Handler implementations    |
| **Desktop Orchestration** | `apps/desktop`        | Desktop-specific coordination    | • RPC handler implementations<br>• Calling conductor.execute()<br>• File system access<br>• Security policies | • Execution implementation<br>• Type definitions<br>• Visual components |
| **Web Orchestration**     | `apps/client`         | Web application coordination     | • Page routing<br>• UI composition<br>• User interactions                                                     | • Executable definitions<br>• Execution logic<br>• RPC implementations  |

## Simplified Architecture with Flow as Composite Node

### Core Insight

**A Flow is just a composite node** - This eliminates special cases and unifies
the entire execution model.

## Execution Architecture

```
┌─────────────────────────────────────────────────┐
│                  Client                          │
│         Creates Executable (Flow or Node)        │
└────────────────┬────────────────────────────────┘
                 │ ExecuteRequest { executable }
                 ↓
┌─────────────────────────────────────────────────┐
│              @atomiton/rpc                       │
│  • Simple transport for any Executable          │
│  • No execution logic                           │
└────────────────┬────────────────────────────────┘
                 │ Routes to desktop
                 ↓
┌─────────────────────────────────────────────────┐
│              Desktop Main                        │
│  • Receives ExecuteRequest                      │
│  • Calls conductor.execute(executable)          │
└────────────────┬────────────────────────────────┘
                 │ Delegates execution
                 ↓
┌─────────────────────────────────────────────────┐
│           @atomiton/conductor                    │
│  • execute(executable) - handles ANY type       │
│  • Uses type guards: isFlow() vs isNode()      │
│  • Returns ExecutionResult                      │
└──────────────────────────────────────────────────┘
```

## Key Architecture Decisions (Updated)

| Decision                              | Choice                          | Reasoning                                                                                 |
| ------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------- |
| **What is a Flow?**                   | A composite node (type: 'flow') | • Unifies execution model<br>• Eliminates special APIs<br>• Simplifies mental model       |
| **How to execute?**                   | `conductor.execute(executable)` | • Single API for everything<br>• Type guards handle differences<br>• No mode flags needed |
| **What does RPC transport?**          | Just `Executable`               | • One request type<br>• No special flow vs node handling<br>• Simpler contracts           |
| **Who transforms for visualization?** | `@atomiton/editor`              | • Still owns visual transform<br>• Uses type guards internally<br>• Same public API       |
| **Who defines types?**                | `@atomiton/flow`                | • Owns Executable interface<br>• Owns Flow and FlowNode<br>• Single source of truth       |

## Simplified Code Examples

### Executable Type Definition (flow package)

```typescript
// @atomiton/flow - Everything is executable
interface Executable {
  id: string;
  type: string;
  version?: string;
}

interface FlowNode extends Executable {
  position: { x: number; y: number };
  config: Record<string, any>;
}

interface Flow extends Executable {
  type: "flow"; // Flows are just nodes with type='flow'
  nodes: FlowNode[];
  connections: Connection[];
}

// Type guards
const isFlow = (e: Executable): e is Flow => e.type === "flow";
const isNode = (e: Executable): e is FlowNode => !isFlow(e);
```

### Universal Execution (conductor package)

```typescript
// @atomiton/conductor - One execute for all
const conductor = createConductor();

// Works with ANY Executable
await conductor.execute(flowExecutable); // Composite execution
await conductor.execute(nodeExecutable); // Single execution
await conductor.execute(anyExecutable); // Figures it out
```

### Simple Transport (rpc package)

```typescript
// @atomiton/rpc - Just transports executables
interface ExecuteRequest {
  id: string;
  executable: Executable; // Can be Flow OR FlowNode
  context?: Record<string, any>;
}

// No mode flags, no special cases
```

### Client Usage (Simplified)

```typescript
// apps/client - Clean API
import { createFlow, createNode } from '@atomiton/flow';
import { rpc } from './lib/rpc';

// Execute a flow
const flow = createFlow({ name: 'My Flow', nodes: [...] });
await rpc.execute(flow);

// Execute a single node (same API!)
const node = createNode({ type: 'httpRequest', config: {...} });
await rpc.execute(node);
```

## Anti-Patterns to Avoid

| ❌ Don't Do This                | ✅ Do This Instead                  | Why                    |
| ------------------------------- | ----------------------------------- | ---------------------- |
| Different APIs for Flow vs Node | One `execute(executable)` API       | Simpler, more flexible |
| Mode flags ('flow' \| 'node')   | Type guards (isFlow, isNode)        | Type-safe, cleaner     |
| Special request types           | One ExecuteRequest type             | Less complexity        |
| Treating Flows specially        | Flows are just composite nodes      | Unified mental model   |
| Complex execution paths         | Single execution with type checking | Easier to understand   |

## Package Dependencies (Simplified)

```
apps/client          apps/desktop
    ↓                    ↓
@atomiton/editor    @atomiton/rpc
    ↓                    ↓
    └─→ @atomiton/flow ←─┘
              ↓
        @atomiton/conductor
              ↓
        @atomiton/nodes
```

## Migration Impact Summary

### What Gets Simpler

1. **Conductor API** - One method: `execute(executable)`
2. **RPC Contracts** - One request type with `executable` field
3. **Client Code** - No mode selection, just pass executable
4. **Testing** - One execution path to test
5. **Mental Model** - Everything is executable

### What Changes

1. **Flow extends Executable** - Not a separate concept
2. **Type guards replace modes** - `isFlow()` instead of `mode: 'flow'`
3. **ExecuteRequest simplified** - Just has `executable` field
4. **Conductor uses type guards** - Internal routing based on type

### What Stays the Same

1. **Package boundaries** - Same ownership model
2. **Visual transformation** - Editor still owns this
3. **Node implementations** - No changes needed
4. **Storage patterns** - Still persist Flows

## Benefits of Flow as Composite Node

1. **Unified Interface** - One API for all execution
2. **Simpler Transport** - One request type
3. **Better Composition** - Flows can contain other flows
4. **Cleaner Testing** - One path through the system
5. **Future Flexibility** - Easy to add new executable types

## Summary

The key insight that **"a Flow is just a composite node"** simplifies the entire
architecture:

- **One execution API** for everything
- **One transport type** for all requests
- **Type guards** instead of mode flags
- **Simpler mental model** for developers
- **More flexibility** for future features

This makes the system both simpler and more powerful!
