# Node Execution Strategy

## Executive Summary

This document outlines the strategy for enabling node execution in the Atomiton platform. While the core architecture is well-designed with strong package separation, critical integration points are missing that prevent actual workflow execution. This strategy provides a phased approach to connect the existing components and enable production-ready node execution.

## Current State Assessment

### Architecture Overview

The system follows a clean separation of concerns with specialized packages:

```
UI Layer (apps/client)
    ↓
Editor (@atomiton/editor)
    ↓
State Management (@atomiton/store)
    ↓
Storage Layer (@atomiton/storage) [BROKEN]
    ↓
Execution Layer (@atomiton/conductor)
    ↓
Node Implementation (@atomiton/nodes)
    ↓
Event System (@atomiton/events) [NOT INTEGRATED]
```

### Package Status Matrix

#### Core Execution Packages

| Package                 | Purpose                            | Status      | Implementation Level                                         |
| ----------------------- | ---------------------------------- | ----------- | ------------------------------------------------------------ |
| **@atomiton/conductor** | Orchestrates node execution        | ✅ Good     | 85% - Storage integration complete, node registry simplified |
| **@atomiton/nodes**     | Node definitions & implementations | ✅ Good     | 90% - Nodes exist but aren't registered                      |
| **@atomiton/events**    | Event system for state sync        | ✅ Complete | 100% - Built but not integrated                              |
| **@atomiton/storage**   | Composite persistence              | ✅ Complete | 100% - Factory implemented, desktop integration done         |
| **@atomiton/store**     | State management                   | ✅ Good     | 100% - Working properly                                      |

#### UI & Editor Packages

| Package              | Purpose                 | Status  | Implementation Level    |
| -------------------- | ----------------------- | ------- | ----------------------- |
| **@atomiton/editor** | Blueprint visual editor | ✅ Good | 100% - Fully functional |
| **@atomiton/ui**     | Component library       | ✅ Good | 100% - Complete         |
| **@atomiton/form**   | Dynamic forms           | ✅ Good | 100% - Working          |

#### Applications

| App              | Purpose          | Status  | Implementation Level                                           |
| ---------------- | ---------------- | ------- | -------------------------------------------------------------- |
| **apps/client**  | React UI         | ✅ Good | 95% - Can't trigger execution                                  |
| **apps/desktop** | Electron wrapper | ✅ Good | 80% - Storage-conductor wiring complete, IPC needs enhancement |

## Critical Gaps Analysis

### 1. ✅ Storage Factory Complete

**Status**: ✅ **COMPLETED** - Storage factory implemented and integrated

- Location: `/packages/@atomiton/storage/src/index.ts`
- ✅ Implemented: `createStorage()` factory function with memory and filesystem support
- ✅ Integration: Desktop app uses filesystem storage in userData directory
- ✅ Unblocked: All composite loading and persistence now functional

### 2. Node Registry Overcomplicated

**Impact**: Composite runner has empty registry and requires manual registration

- Location: `/packages/@atomiton/conductor/src/execution/composite/compositeRunner.ts` (line 30)
- Problem: Manual registry when @atomiton/nodes package IS the registry
- Solution: Use nodes package directly instead of separate registry
- Blocks: Node validation and instantiation

### 3. Electron IPC Bridge Incomplete

**Impact**: Renderer process cannot communicate with main process conductor

- Location: `/apps/desktop/src/preload/`
- Missing: Conductor-specific IPC methods
- Blocks: UI-triggered execution

### 4. ✅ Main Process Storage Integration Complete

**Status**: ✅ **COMPLETED** - Desktop app now has persistent storage

- Location: `/apps/desktop/src/main/index.ts`
- ✅ Implemented: Storage initialization with filesystem backend
- ✅ Path: `{userData}/atomiton-data` directory structure
- ✅ Integration: Conductor receives configured storage instance
- ⚠️ Remaining: IPC handlers for renderer communication still needed

### 5. Events Not Integrated

**Impact**: No real-time execution feedback or progress monitoring

- Location: Integration points throughout conductor
- Missing: Event emission during execution lifecycle
- Blocks: User visibility into execution progress

## Storage Strategy

### Environment-Based Storage Selection

**Desktop App (MVP)**:

- `filesystem` storage in user's app data directory
- No cloud costs, user owns their data locally
- Full persistence across app restarts

**Storage Layer Separation**:

- **App State**: Zustand + localStorage (UI preferences, window state)
- **User Content**: @atomiton/storage (YAML files, composite definitions)

**Future Premium Features** (documented in storage package roadmap):

- Cloud storage integration (Google Drive, Dropbox, OneDrive)
- Cross-device sync capabilities
- Team collaboration storage

## Implementation Strategy

### Phase 0: Quick Wins (2-4 hours)

**Goal**: Unblock basic development and testing

#### Tasks:

1. **Create Storage Factory**

   ```typescript
   // packages/@atomiton/storage/src/index.ts
   export function createStorage(config: StorageConfig): IStorageEngine {
     switch (config.type) {
       case "memory":
         return new InMemoryStorage();
       case "filesystem":
         return new FileSystemStorage(config);
       default:
         throw new Error(`Unknown storage type: ${config.type}`);
     }
   }
   ```

   **Implementation Prompt:**

   ```markdown
   TASK: Implement Storage Factory for Universal Data Layer

   OVERVIEW:
   Create a storage factory that serves as the one-stop-shop for all data persistence in the Atomiton platform. This factory must follow core development principles: abstraction, encapsulation, extensibility, single responsibility principle.

   CURRENT STATE:

   - FileSystemStorage class exists in @atomiton/storage
   - No factory function to create storage instances
   - Conductor expects storage but can't instantiate it
   - Blocking node execution (see NODE_EXECUTION_STRATEGY.md)

   REQUIREMENTS:

   Phase 0 Implementation:

   1. Create createStorage() factory function
   2. Implement InMemoryStorage class for testing
   3. Create ROADMAP.md documenting future storage types
   4. Wire existing FileSystemStorage into factory
   5. Ensure async-first design for future extensibility

   Technical Specifications:

   - Single entry point: createStorage(config: StorageConfig)
   - Unified interface: load(), save(), delete() methods
   - Support 'memory' and 'filesystem' types initially
   - Abstract interface supports future: databases, cloud storage, browser APIs
   - Follow existing package patterns in the monorepo

   Success Criteria:

   - Conductor can create storage instances
   - In-memory storage works for testing
   - FileSystem storage accessible via factory
   - Clean abstraction ready for future storage types

   AGENT COORDINATION:

   - Michael: Design storage interface and factory architecture
   - Voorhees: Review for complexity and ensure clean abstractions
   - Karen: Validate storage instances work with conductor
   - Barbara: Create ROADMAP.md documentation

   DELIVERABLES:

   1. Updated @atomiton/storage/src/index.ts with createStorage()
   2. InMemoryStorage implementation
   3. ROADMAP.md in storage package
   4. Working integration with conductor
   5. Unit tests for storage factory
   ```

2. **Eliminate Node Registry (Use Nodes Package Directly)**

   ```typescript
   // packages/@atomiton/conductor/src/execution/composite/compositeRunner.ts
   import { nodes } from "@atomiton/nodes/executable";

   // Remove: const nodeRegistry = new Map<string, INode>();
   // Remove: registerNode() function

   // In validation:
   if (!nodes[nodeType]) throw new Error(`Unknown node type: ${nodeType}`);

   // In execution:
   const node = nodes[nodeType](config);
   ```

   **Implementation Prompt:**

   ```markdown
   TASK: Eliminate Node Registry - Use Nodes Package Directly

   OVERVIEW:
   Remove the unnecessary node registry system and use the @atomiton/nodes package as the single source of truth for available nodes. This simplifies the architecture and eliminates manual registration.

   WORKFLOW REQUIREMENTS:

   1. Create new worktree: `wtnew node-registry-elimination`
   2. Work in worktree: `cd ../atomiton-node-registry-elimination`
   3. Follow .claude/workflow/EXECUTION_PLAN.md
   4. Get Karen's approval before completing

   CURRENT PROBLEM:

   - Composite runner has empty node registry Map
   - Nodes must be manually registered
   - Validation fails: "Unknown node type"
   - @atomiton/nodes package already exports all nodes

   SOLUTION:
   Replace registry with direct node package imports

   TECHNICAL CHANGES:

   1. **Update Composite Runner** (`packages/@atomiton/conductor/src/execution/composite/compositeRunner.ts`):
      - Remove: `const nodeRegistry = new Map<string, INode>()`
      - Remove: `registerNode()` function
      - Add: `import { nodes } from '@atomiton/nodes/executable'`
      - Update validation call to pass nodes object instead of registry

   2. **Update Validation** (`packages/@atomiton/conductor/src/execution/composite/validation.ts`):
      - Change parameter from `nodeRegistry: Map<string, INode>` to `nodes: Record<string, any>`
      - Update check from `nodeRegistry.has(node.type)` to `nodes[node.type]`

   3. **Update Node Execution**:
      - Find where nodes are instantiated
      - Replace registry lookup with `nodes[nodeType](config)`

   4. **Update Tests**:
      - Remove registry-related test setup
      - Update mocks to use nodes object

   SUCCESS CRITERIA:

   - Composite validation works without registry
   - Nodes can be instantiated by type string
   - All existing tests pass
   - Registry Map completely removed

   AGENT COORDINATION:

   - Megamind: Analyze complex integration points and dependencies
   - Voorhees: Simplify architecture by removing unnecessary abstractions
   - Karen: Validate that node execution still works end-to-end

   DELIVERABLES:

   1. Updated composite runner without registry
   2. Updated validation to use nodes directly
   3. Working node instantiation
   4. All tests passing
   5. Clean commit with descriptive message

   This eliminates unnecessary complexity while maintaining all functionality.
   ```

3. **✅ Storage-Conductor Wiring Complete**

   ```typescript
   // ✅ IMPLEMENTED in apps/desktop/src/main/index.ts
   import { app } from "electron";
   import { createStorage } from "@atomiton/storage";
   import { createConductor } from "@atomiton/conductor";
   import path from "path";

   const storage = await createStorage({
     type: "filesystem",
     basePath: path.join(app.getPath("userData"), "atomiton-data"),
   });

   const conductor = createConductor({ storage });
   ```

   - ✅ Desktop app uses filesystem storage by default
   - ✅ User data persists in userData directory (free, local)
   - ✅ Clear separation from app state (Zustand + localStorage)
   - ✅ Error handling for storage initialization failures

   **Implementation Prompt:**

   ````markdown
   TASK: Wire Storage to Conductor - Desktop MVP Implementation

   OVERVIEW:
   Connect the storage factory to conductor so user-created composites persist to the filesystem in Electron's userData directory. This completes Phase 0 and enables basic node execution.

   WORKFLOW REQUIREMENTS:

   1. Create new worktree: `wtnew storage-conductor-integration`
   2. Work in worktree: `cd ../atomiton-storage-conductor-integration`
   3. Follow .claude/workflow/EXECUTION_PLAN.md
   4. Get Karen's approval before completing

   IMPLEMENTATION COMPLETED:

   - ✅ Conductor receives properly configured filesystem storage
   - ✅ User composites persist in `{userData}/atomiton-data` directory
   - ✅ Desktop filesystem storage fully initialized with error handling

   STORAGE STRATEGY (Desktop-First MVP):

   - Use filesystem storage in app.getPath('userData')/atomiton-data
   - Clear separation from app state (Zustand + localStorage)
   - Local storage only (no cloud costs)

   TECHNICAL CHANGES:

   1. **Update Electron Main Process** (`apps/desktop/src/main/`):

      ```typescript
      import { createStorage } from "@atomiton/storage";
      import { createConductor } from "@atomiton/conductor";
      import { app } from "electron";
      import path from "path";

      const storage = createStorage({
        type: "filesystem",
        path: path.join(app.getPath("userData"), "atomiton-data"),
      });

      const conductor = createConductor({ storage });
      ```
   ````

   2. **Ensure Storage Directory Creation**:
      - Handle directory creation if it doesn't exist
      - Add error handling for filesystem permissions

   3. **Test Storage Integration**:
      - Verify conductor can save/load composites
      - Test persistence across app restarts

   SUCCESS CRITERIA:
   - Conductor initializes with filesystem storage
   - User data persists in userData/atomiton-data directory
   - Composites can be loaded for execution
   - Storage initialization errors are handled gracefully

   AGENT COORDINATION:
   - Parker: Electron integration and filesystem setup
   - Michael: Conductor configuration and storage integration
   - Karen: Validate end-to-end storage persistence

   This completes Phase 0, enabling the conductor to load and execute user-created composites.

   ```

   ```

### Phase 1: Enable Basic Execution (1-2 days)

**Goal**: Execute a single node end-to-end through the desktop app

#### Tasks:

4. **Fix Electron IPC Bridge (Events-Based Approach)**

   ```typescript
   // Use @atomiton/events for cross-process communication
   import { createEventManager } from "@atomiton/events/desktop";
   import { createEventManager } from "@atomiton/events/browser";

   // UI side - trigger execution and wait for result
   const events = createEventManager();
   const conductorBus = events.createBus<ConductorEvents>("conductor");

   const result = await conductorBus.emit("execute", { compositeId, inputs });
   console.log("Execution completed:", result);

   // Main process - handle execution asynchronously
   conductorBus.on("execute", async (data) => {
     const result = await conductor.execute(data);
     return result; // Auto-emits response back to caller
   });
   ```

   **PREREQUISITE: Modernize Events Package First**

   **Implementation Prompt:**

   ````markdown
   TASK: Modernize Events Package - Functional Architecture

   OVERVIEW:
   Modernize the @atomiton/events package from class-based singletons to functional factory patterns with environment-specific exports, following the same patterns as @atomiton/nodes and @atomiton/storage.

   WORKFLOW REQUIREMENTS:

   1. Create new worktree: `wtnew events-modernization`
   2. Work in worktree: `cd ../atomiton-events-modernization`
   3. Follow .claude/workflow/EXECUTION_PLAN.md
   4. Get Karen's approval before completing

   CURRENT PROBLEMS:

   - Mixed architecture patterns (class + functional)
   - Singleton EventsAPI instance
   - No environment-specific exports
   - No legacy concerns (nobody using this yet)

   MODERNIZATION GOALS:

   1. **Functional Factory Pattern**
      - Replace EventsAPI singleton with createEventManager()
      - Replace UnifiedEmitter class with factory functions
      - Follow @atomiton/storage pattern

   2. **Environment-Specific Exports**

      ```typescript
      // Browser environment (EventEmitter3)
      packages/@atomiton/events/src/exports/browser/index.ts

      // Desktop environment (Node EventEmitter + IPC)
      packages/@atomiton/events/src/exports/desktop/index.ts
      ```
   ````

   3. **Clean API Surface (Async-First)**

      ```typescript
      import { createEventManager } from "@atomiton/events/browser";
      import { createEventManager } from "@atomiton/events/desktop";

      const events = createEventManager(config);

      // Typed event buses with async support
      const conductorBus = events.createBus<ConductorEvents>("conductor");

      // Async event emission and handling
      const result = await conductorBus.emit("execute", { compositeId });

      conductorBus.on("execute", async (data) => {
        const result = await conductor.execute(data);
        await conductorBus.emit("complete", result);
      });
      ```

   TECHNICAL CHANGES:
   1. **Create Factory Functions (Async-First)**
      - `createEventManager()` - Main factory with async event emission
      - `createBrowserEventManager()` - EventEmitter3 based with Promise support
      - `createDesktopEventManager()` - Node.js EventEmitter + IPC with async handling

      ```typescript
      // Core async patterns to implement (extend EventEmitter3):
      // Note: EventEmitter3 supports async handlers but not awaitable emission

      // 1. Promise-based event emission (NEW - build on top of EventEmitter3)
      const result = await eventBus.emit("execute", data, { timeout: 30000 });

      // 2. Async event handlers with auto-response (extend existing async support)
      eventBus.on("execute", async (data) => {
        const result = await someAsyncOperation(data);
        return result; // NEW: Return value becomes emit() promise result
      });

      // 3. Implementation strategy:
      // - Use correlation IDs for request/response pairing
      // - Build promise resolution layer on top of EventEmitter3
      // - Mirror this behavior for Node.js EventEmitter in desktop export
      // - Handle cross-process async via IPC correlation
      ```

   2. **Environment Detection & Exports**
      - `/browser` export - Pure EventEmitter3, no IPC
      - `/desktop` export - Node EventEmitter + IPC bridge
      - Main export - Auto-detection wrapper

   3. **Preserve Existing Features + Add Async Support**
      - IPC cross-process communication
      - Event filtering and subscriptions
      - Typed event buses
      - Error handling
      - **NEW: Async-first event emission and handling**
      - **NEW: Promise-based event responses**
      - **NEW: Timeout support for async operations**

   4. **Update Package.json Exports**

      ```json
      "exports": {
        "./browser": { "import": "./dist/exports/browser/index.js" },
        "./desktop": { "import": "./dist/exports/desktop/index.js" },
        ".": { "import": "./dist/index.js" }
      }
      ```

   5. **Update Nodes Package Exports (Consistency)**
      ```json
      // Also update @atomiton/nodes package.json exports
      "exports": {
        "./browser": { "import": "./dist/exports/browser/index.js" },
        "./desktop": { "import": "./dist/exports/desktop/index.js" },
        ".": { "import": "./dist/index.js" }
      }
      ```

      - Rename `/executable` export to `/desktop` for consistency
      - Update any existing imports (minimal since Electron side not using yet)

   SUCCESS CRITERIA:
   - Functional factory pattern throughout
   - Clean browser/desktop environment splits
   - Existing IPC functionality preserved
   - Same API capabilities as before
   - **Async-first event emission and handling**
   - **Promise-based responses with timeout support**
   - Ready for conductor integration

   AGENT COORDINATION:
   - **Voorhees**: Review async-await emission pattern - is this over-engineering?
   - **Michael**: Validate if request/response pattern is architecturally sound
   - **Alternative approaches**: Standard emit/on vs manual promise handling vs correlation IDs
   - Parker: Ensure IPC functionality works in desktop environment
   - Karen: Validate that modernized events work as expected

   **VALIDATION QUESTIONS FOR VOORHEES & MICHAEL:**
   1. Is `await eventBus.emit('execute', data)` actually needed?
   2. Would simple `eventBus.emit()` + `eventBus.on()` be sufficient?
   3. Are we over-complicating with correlation IDs and promise layers?
   4. Could we handle request/response manually in conductor instead?

   DELIVERABLES:
   1. Functional event manager factories
   2. Browser/desktop environment exports (same API)
   3. Async-first event emission and handling
   4. Promise-based event responses with timeout support
   5. Updated package.json exports
   6. Working IPC cross-process communication
   7. All tests passing
   8. Ready for conductor integration

   This modernization enables clean conductor event integration in Phase 1.

   ```

   ```

5. **Initialize Conductor in Main Process**

   ```typescript
   // apps/desktop/src/main/conductor.ts
   import { createConductor } from "@atomiton/conductor";
   import { createStorage } from "@atomiton/storage";
   import { registerBuiltinNodes } from "./nodes";

   export async function setupConductor() {
     const storage = createStorage({ type: "filesystem", path: "./data" });
     const conductor = createConductor({ storage });

     registerBuiltinNodes();

     ipcMain.handle("conductor:execute", async (event, request) => {
       return conductor.execute(request);
     });
   }
   ```

6. **Add Execute Button to UI**
   - Create execution trigger in editor toolbar
   - Display basic execution results

### Phase 2: Real-time Feedback (2-3 days)

**Goal**: Provide execution progress and live updates

#### Tasks:

7. **Integrate Events Package**
   - Emit events from conductor during execution
   - Create event bus for cross-process communication
   - Subscribe to events in UI for progress updates

8. **Implement WebSocket Transport**
   - Enable real-time communication for external integrations
   - Stream execution progress to connected clients

9. **Error Handling & Recovery**
   - Structured error types for different failure modes
   - Retry mechanisms for transient failures
   - User-friendly error messages

### Phase 3: Production Features (1 week)

**Goal**: Make the system robust and production-ready

#### Tasks:

10. **Resource Management**
    - Memory usage monitoring and limits
    - CPU throttling for intensive operations
    - Timeout handling for long-running nodes
    - Process isolation for dangerous operations

11. **Advanced Node Types**
    - Platform-specific nodes (Windows, macOS, Linux)
    - Cloud service integrations (AWS, Azure, GCP)
    - Database connectors
    - ML/AI nodes

12. **Testing Infrastructure**
    - Mock nodes for deterministic testing
    - End-to-end execution test suite
    - Performance benchmarks
    - Load testing for concurrent executions

### Phase 4: Developer Experience (Ongoing)

**Goal**: Polish the system and improve developer productivity

#### Tasks:

13. **Debugging Tools**
    - Execution timeline visualization
    - Node performance profiling
    - Step-through debugging
    - Execution replay from logs

14. **Documentation & Guides**
    - Node development guide
    - Execution architecture documentation
    - API reference
    - Example workflows

## Testing Strategy

### Unit Testing

- Test each component in isolation
- Mock dependencies for focused testing
- Achieve >80% code coverage

### Integration Testing

1. Test storage ↔ conductor integration
2. Test IPC communication flow
3. Test composite execution end-to-end
4. Test event propagation across processes

### Mock Strategy

- Create `InMemoryStorage` for testing without filesystem
- Create deterministic mock nodes with predictable behavior
- Mock IPC layer for renderer testing
- Create test harness for execution scenarios

### Performance Testing

- Benchmark node execution overhead
- Test concurrent execution limits
- Measure memory usage patterns
- Profile CPU utilization

## Risk Mitigation

### Technical Risks

| Risk                                    | Impact | Mitigation                                             |
| --------------------------------------- | ------ | ------------------------------------------------------ |
| Memory leaks in long-running executions | High   | Implement proper cleanup, use WeakMaps, add monitoring |
| Deadlocks in parallel execution         | High   | Use dependency graph analysis, add timeout detection   |
| IPC message saturation                  | Medium | Implement batching, use compression, add backpressure  |
| Infinite loops in user code             | High   | Add execution time limits, implement kill switches     |
| State corruption across processes       | Medium | Use event sourcing, implement state snapshots          |

### Architecture Risks

| Risk                            | Impact | Mitigation                                          |
| ------------------------------- | ------ | --------------------------------------------------- |
| Tight coupling between packages | Medium | Maintain clean interfaces, use dependency injection |
| Platform-specific code in core  | High   | Abstract platform features, use adapter pattern     |
| Scalability limitations         | Medium | Design for horizontal scaling, use worker pools     |

## Success Metrics

### Phase 0 Success Criteria

- [ ] Storage factory creates instances (memory + filesystem)
- [ ] Nodes package used directly (no separate registry)
- [ ] Conductor can load composites from storage

### Phase 1 Success Criteria

- [ ] Execute button triggers conductor
- [ ] Single node executes successfully
- [ ] Results display in UI

### Phase 2 Success Criteria

- [ ] Real-time progress updates work
- [ ] Errors display with clear messages
- [ ] WebSocket transport functional

### Phase 3 Success Criteria

- [ ] System handles 100+ concurrent executions
- [ ] Memory usage stays within limits
- [ ] All node types execute correctly

### Phase 4 Success Criteria

- [ ] Developer documentation complete
- [ ] Debugging tools functional
- [ ] Performance meets benchmarks

## Timeline

| Phase   | Duration  | Dependencies | Team            |
| ------- | --------- | ------------ | --------------- |
| Phase 0 | 2-4 hours | None         | Michael, Parker |
| Phase 1 | 1-2 days  | Phase 0      | Parker, Michael |
| Phase 2 | 2-3 days  | Phase 1      | Michael, Ryan   |
| Phase 3 | 1 week    | Phase 2      | Full team       |
| Phase 4 | Ongoing   | Phase 3      | Brian, Barbara  |

## Conclusion

The Atomiton node execution architecture has a solid foundation with well-designed packages and clean separation of concerns. The critical missing pieces are integration points between packages rather than fundamental architectural flaws. By following this phased approach, we can quickly enable basic execution and progressively add production features while maintaining system stability.

The key to success is maintaining discipline in the implementation order - fixing the critical blockers first before adding advanced features. With the Phase 0 quick wins, we can unblock development in just a few hours and have a working execution system within days.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-09-18
**Status**: Active Strategy
**Owner**: Architecture Team
