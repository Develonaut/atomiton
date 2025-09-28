# IPC Architecture Analysis and Improvement Plan

## Executive Summary

The current IPC architecture in the Atomiton desktop application has a critical
duplication issue between the preload scripts and the RPC package. The preload
environment's limitations (no external packages) are forcing API structure
repetition, violating DRY principles and creating maintenance burden. This
document analyzes the current architecture and proposes a **Generic Transport
Pattern** that establishes the RPC package as the single source of truth for all
IPC communication.

## Current Architecture Analysis

### Pain Points Identified

1. **API Duplication**: The preload script (`apps/desktop/src/preload`) is
   duplicating API definitions that already exist in the RPC package
2. **Limited Preload Context**: Preload scripts cannot import external packages
   due to Electron's sandboxing
3. **Coupling Issues**: The conductor package is tightly coupled to the specific
   implementation details
4. **Multiple Sources of Truth**: Channel definitions and API contracts exist in
   multiple places
5. **Type Safety Challenges**: Maintaining type consistency across boundaries is
   difficult

### Current Component Responsibilities

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Renderer      │────▶│   Preload    │────▶│   Main Process  │
│  (Client App)   │     │  (Limited)   │     │   (Full Node)   │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                      │                       │
        │                      │                       │
        ▼                      ▼                       ▼
   Conductor              Duplicated            RPC Package
   (Interface)           API Structure         (Transport Layer)
```

### Key Constraints

Based on research and documentation review:

1. **Preload scripts are sandboxed** (Electron 20+) and have limited `require()`
   functionality
2. **Cannot import custom modules** in preload unless bundled
3. **Security requirement**: Never expose full `ipcRenderer` module
4. **Type safety requirement**: Maintain TypeScript types across all boundaries
5. **Performance consideration**: Minimize serialization overhead

## Proposed Solution: Generic Transport Pattern

### Core Concept

Implement a **single generic IPC channel** in the preload script that acts as a
universal transport layer. The RPC package then becomes the sole authority for
routing, API definitions, and business logic.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Renderer Process                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Client Application                   │   │
│  │  ┌────────────┐      ┌──────────────┐                   │   │
│  │  │ Conductor  │─────▶│  RPC Client  │                   │   │
│  │  │ (Interface)│      │  (Renderer)  │                   │   │
│  │  └────────────┘      └──────────────┘                   │   │
│  │                             │                            │   │
│  │                             ▼                            │   │
│  │                    window.atomitonBridge                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Generic Transport
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Preload Script                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Minimal Generic Bridge (No Business Logic)              │   │
│  │  - Single invoke channel: 'rpc:invoke'                   │   │
│  │  - Single listen channel: 'rpc:event'                    │   │
│  │  - Pure message passing, no API knowledge               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ IPC
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Main Process                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     RPC Server (Main)                     │   │
│  │  ┌─────────────┐  ┌────────────┐  ┌────────────────┐    │   │
│  │  │   Router    │──│  Handlers  │──│  Node Executor  │    │   │
│  │  │  (Routes)   │  │  (Logic)   │  │   (Business)    │    │   │
│  │  └─────────────┘  └────────────┘  └────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. Minimal Preload Bridge

**File**: `apps/desktop/src/preload/index.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";

// Minimal generic bridge - no business logic
const bridge = {
  // Generic invoke for request/response
  invoke: (method: string, params?: unknown) =>
    ipcRenderer.invoke("rpc:invoke", { method, params }),

  // Generic event subscription
  on: (event: string, callback: (data: unknown) => void) => {
    const listener = (_: unknown, data: unknown) => callback(data);
    ipcRenderer.on(`rpc:event:${event}`, listener);
    return () => ipcRenderer.removeListener(`rpc:event:${event}`, listener);
  },

  // One-way message
  send: (method: string, params?: unknown) =>
    ipcRenderer.send("rpc:send", { method, params }),
};

contextBridge.exposeInMainWorld("atomitonBridge", bridge);
```

**Benefits**:

- **Minimal surface area** - only 3 generic methods
- **No API knowledge** - preload doesn't know about business logic
- **Type-safe** - can generate types from RPC package
- **Secure** - limited exposure of IPC functionality

#### 2. RPC Package as Single Source of Truth

**Structure**:

```
packages/@atomiton/rpc/
├── src/
│   ├── shared/
│   │   ├── api.ts         # API contract definitions
│   │   ├── types.ts       # Shared types
│   │   └── registry.ts    # Method registry
│   ├── main/
│   │   ├── router.ts      # Route method calls to handlers
│   │   ├── handlers/      # Domain-specific handlers
│   │   │   ├── node.ts
│   │   │   ├── system.ts
│   │   │   └── storage.ts
│   │   └── server.ts      # Main IPC server
│   ├── renderer/
│   │   ├── client.ts      # Type-safe client
│   │   └── proxy.ts       # Proxy for method calls
│   └── index.ts
```

**Key Components**:

```typescript
// shared/api.ts - Single source of API truth
export interface AtomitonAPI {
  node: {
    execute(params: NodeExecuteParams): Promise<NodeExecuteResult>;
    getStatus(nodeId: string): Promise<NodeStatus>;
  };
  system: {
    health(): Promise<HealthStatus>;
    getInfo(): Promise<SystemInfo>;
  };
  storage: {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<void>;
  };
}

// main/router.ts - Central routing logic
export class RPCRouter {
  private handlers = new Map<string, Handler>();

  async route(method: string, params: unknown): Promise<unknown> {
    const [domain, action] = method.split(".");
    const handler = this.handlers.get(domain);
    if (!handler) throw new Error(`Unknown domain: ${domain}`);
    return handler.execute(action, params);
  }
}

// renderer/client.ts - Type-safe client using Proxy
export function createRPCClient<T = AtomitonAPI>(): T {
  return new Proxy({} as T, {
    get(_, domain: string) {
      return new Proxy(
        {},
        {
          get(_, method: string) {
            return (...args: unknown[]) => {
              const methodPath = `${domain}.${method}`;
              return window.atomitonBridge.invoke(methodPath, args);
            };
          },
        },
      );
    },
  });
}
```

#### 3. Conductor Integration

The conductor package simply uses the RPC client without knowing implementation
details:

```typescript
// packages/@atomiton/conductor/src/browser/index.ts
import { createRPCClient } from "@atomiton/rpc/renderer";

export function createConductor(config?: ConductorConfig) {
  const rpc = config?.rpcClient || createRPCClient();

  return {
    node: {
      async run(node: NodeDefinition, context?: Context) {
        return rpc.node.execute({
          nodeId: node.id,
          inputs: context?.inputs,
          // ... other params
        });
      },
    },
    system: {
      async health() {
        return rpc.system.health();
      },
    },
  };
}
```

### Migration Strategy

#### Phase 1: Implement Generic Bridge (Week 1)

1. Create minimal preload bridge
2. Test generic transport with simple ping/pong
3. Ensure type safety across boundaries

#### Phase 2: Refactor RPC Package (Week 2)

1. Implement router and handler pattern
2. Create type-safe client with Proxy
3. Define complete API in shared module
4. Write comprehensive tests

#### Phase 3: Update Conductor (Week 3)

1. Replace direct IPC calls with RPC client
2. Remove transport-specific logic
3. Update tests

#### Phase 4: Integration Testing (Week 4)

1. Full end-to-end testing
2. Performance benchmarking
3. Security audit

### Benefits of This Approach

1. **Single Source of Truth**: API defined once in RPC package
2. **Minimal Preload**: Preload script is tiny and rarely changes
3. **Type Safety**: Full TypeScript support with generated types
4. **Flexibility**: Easy to add new methods without touching preload
5. **Testability**: Can mock RPC client for testing
6. **Security**: Minimal exposure of IPC functionality
7. **Maintainability**: Clear separation of concerns

### Alternative Patterns Considered

#### 1. TRPC Integration

- **Pros**: Battle-tested, type-safe, great DX
- **Cons**: Overhead for simple IPC, requires bundling in preload
- **Verdict**: Good option but adds complexity

#### 2. Multiple Preload Scripts (Electron 35+)

- **Pros**: Better modularity
- **Cons**: Still limited by sandboxing, requires Electron 35+
- **Verdict**: Doesn't solve core issue

#### 3. Direct Channel Mapping

- **Pros**: Simple, direct
- **Cons**: Requires updating preload for each new method
- **Verdict**: Current approach - causes duplication

### Security Considerations

1. **Input Validation**: All inputs validated in main process handlers
2. **Method Whitelisting**: Only registered methods can be called
3. **No Direct IPC Access**: Renderer never gets raw IPC access
4. **Context Isolation**: Maintained throughout
5. **Rate Limiting**: Can be added at router level

### Performance Optimizations

1. **Lazy Handler Loading**: Load handlers only when needed
2. **Response Caching**: Cache frequently requested data
3. **Batch Operations**: Support batch requests in single IPC call
4. **Compression**: For large payloads
5. **Connection Pooling**: Reuse IPC connections

### Code Examples

#### Example: Adding a New API Method

With the generic pattern, adding a new method requires changes only in the RPC
package:

```typescript
// 1. Add to API contract (shared/api.ts)
export interface AtomitonAPI {
  // ... existing
  workflow: {
    create(params: WorkflowParams): Promise<Workflow>;
    list(): Promise<Workflow[]>;
  };
}

// 2. Add handler (main/handlers/workflow.ts)
export class WorkflowHandler {
  async create(params: WorkflowParams): Promise<Workflow> {
    // Implementation
  }

  async list(): Promise<Workflow[]> {
    // Implementation
  }
}

// 3. Register handler (main/server.ts)
router.register("workflow", new WorkflowHandler());

// That's it! No preload changes needed
```

#### Example: Using from Renderer

```typescript
// In React component
import { createRPCClient } from '@atomiton/rpc/renderer';

const rpc = createRPCClient();

function MyComponent() {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    rpc.workflow.list().then(setWorkflows);
  }, []);

  const handleCreate = async () => {
    const workflow = await rpc.workflow.create({ name: 'New' });
    setWorkflows([...workflows, workflow]);
  };

  return (
    // UI
  );
}
```

### Testing Strategy

#### Unit Tests

```typescript
// Test router
describe("RPCRouter", () => {
  it("routes to correct handler", async () => {
    const router = new RPCRouter();
    const mockHandler = { execute: jest.fn() };
    router.register("test", mockHandler);

    await router.route("test.method", { param: 1 });

    expect(mockHandler.execute).toHaveBeenCalledWith("method", { param: 1 });
  });
});
```

#### Integration Tests

```typescript
// Test full flow
describe("IPC Integration", () => {
  it("executes node through full stack", async () => {
    const rpc = createRPCClient();
    const result = await rpc.node.execute({
      nodeId: "test-node",
      inputs: { value: 42 },
    });

    expect(result.success).toBe(true);
    expect(result.outputs.value).toBe(42);
  });
});
```

### Monitoring and Debugging

Add comprehensive logging at each layer:

```typescript
// Router level
class RPCRouter {
  async route(method: string, params: unknown) {
    console.log(`[RPC] Routing: ${method}`, params);
    const start = Date.now();

    try {
      const result = await this.handleRoute(method, params);
      console.log(`[RPC] Success: ${method} (${Date.now() - start}ms)`);
      return result;
    } catch (error) {
      console.error(`[RPC] Error: ${method}`, error);
      throw error;
    }
  }
}
```

### Future Enhancements

1. **WebSocket Fallback**: For web-only mode
2. **Service Worker Support**: For PWA compatibility
3. **Plugin System**: Allow third-party extensions
4. **GraphQL Layer**: For complex queries
5. **Event Sourcing**: For state management

## Recommended Action Items

### Immediate (This Week)

1. ✅ Prototype generic bridge pattern
2. ✅ Validate approach with simple test case
3. ✅ Get team buy-in on architecture

### Short-term (Next 2 Weeks)

1. ⏳ Implement complete RPC router
2. ⏳ Create type generation tooling
3. ⏳ Write comprehensive tests

### Medium-term (Next Month)

1. ⏳ Migrate all existing IPC calls
2. ⏳ Update conductor package
3. ⏳ Performance optimization

### Long-term (Next Quarter)

1. ⏳ Add monitoring/telemetry
2. ⏳ Implement advanced features
3. ⏳ Open-source consideration

## Conclusion

The proposed Generic Transport Pattern solves the core architectural issues by:

- Establishing the RPC package as the single source of truth
- Minimizing the preload script to a simple, stable bridge
- Providing type safety across all boundaries
- Enabling easy extensibility without touching preload
- Maintaining security best practices

This approach aligns with Electron best practices while providing a clean,
maintainable architecture that scales with the application's needs.

## References

1. [Electron IPC Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)
2. [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
3. [Process Sandboxing in Electron](https://www.electronjs.org/docs/latest/tutorial/sandbox)
4. [VS Code Architecture](https://github.com/microsoft/vscode)
5. Research on RPC patterns in Electron applications

---

## Claude Code Migration Prompt

**Use this prompt with Claude Code to implement the Generic Transport Pattern
migration:**

```
I need help implementing a Generic Transport Pattern migration for our Electron IPC architecture as documented in ./.claude/IPC_ARCHITECTURE_ANALYSIS.md.

CONTEXT:
- We're migrating from a duplicated API structure (in both preload and RPC package) to a single source of truth
- The preload script is limited and cannot import external packages due to Electron sandboxing
- Current structure: apps/desktop/src/preload duplicates API definitions from packages/@atomiton/rpc
- Goal: Minimal preload bridge that only handles generic transport, with RPC package owning all API logic

ARCHITECTURE DECISION (already made):
We're implementing a Generic Transport Pattern where:
1. Preload exposes only 3 generic methods: invoke(), on(), send()
2. RPC package becomes the single source of truth with router/handler pattern
3. Conductor package consumes RPC client without knowing transport details

IMPLEMENTATION PHASES:

PHASE 1: Create Minimal Preload Bridge
1. Update apps/desktop/src/preload/index.ts to expose only generic bridge methods
2. Expose via contextBridge as 'atomitonBridge' with invoke, on, and send methods
3. Use channels: 'rpc:invoke', 'rpc:event:*', 'rpc:send'
4. Generate TypeScript declarations for window.atomitonBridge

PHASE 2: Implement RPC Router Infrastructure
1. Create packages/@atomiton/rpc/src/shared/api.ts with AtomitonAPI interface
2. Implement packages/@atomiton/rpc/src/main/router.ts with method routing logic
3. Create domain handlers in packages/@atomiton/rpc/src/main/handlers/
4. Set up IPC listener in main process that routes through RPCRouter

PHASE 3: Build Type-Safe RPC Client
1. Create packages/@atomiton/rpc/src/renderer/client.ts with Proxy-based client
2. Ensure full TypeScript type inference from AtomitonAPI interface
3. Export createRPCClient() function for renderer usage

PHASE 4: Update Conductor Integration
1. Modify packages/@atomiton/conductor to use RPC client
2. Remove any direct IPC references from conductor
3. Update conductor's browser entry point to use createRPCClient()

CONSTRAINTS:
- Preload CANNOT import from packages/@atomiton/rpc (bundling limitation)
- Must maintain context isolation and security best practices
- All IPC must go through the generic bridge - no direct ipcRenderer access
- Type safety must be preserved across all boundaries
- Backwards compatibility during migration (use feature flags if needed)

VALIDATION CRITERIA:
- [ ] Preload script is under 50 lines and has no business logic
- [ ] Adding new API methods requires changes only in RPC package
- [ ] Full type inference works from renderer to main process
- [ ] All existing functionality continues to work
- [ ] Performance is equal or better than current implementation

FILE STRUCTURE TO CREATE/MODIFY:
```

apps/desktop/src/ preload/ index.ts # Minimal generic bridge types.d.ts #
TypeScript declarations

packages/@atomiton/rpc/ src/ shared/ api.ts # API contract (single source of
truth) types.ts # Shared type definitions registry.ts # Method registry main/
router.ts # Central routing logic server.ts # IPC server setup handlers/
node.ts # Node execution handlers system.ts # System info handlers  
 storage.ts # Storage handlers renderer/ client.ts # Type-safe RPC client
proxy.ts # Proxy implementation types.ts # Renderer-specific types index.ts #
Package exports

```

PLEASE START WITH:
1. Show me the current preload/index.ts to understand what needs migration
2. Create the minimal generic bridge implementation
3. Implement the RPC router pattern step by step
4. Ensure all type safety is preserved

KEY REQUIREMENTS:
- Question every assumption about the implementation
- Validate patterns against Electron security best practices
- Consider performance implications of Proxy usage
- Document trade-offs in code comments
- Write unit tests for critical paths
```

### Alternative Prompt for Specific Phase Implementation

```
Implement [PHASE X] of the Generic Transport Pattern migration as documented in ./.claude/IPC_ARCHITECTURE_ANALYSIS.md

[Include relevant phase details from above]

Show me:
1. Current implementation that needs to change
2. New implementation following the pattern
3. Migration path to avoid breaking changes
4. Tests to validate the implementation
```
