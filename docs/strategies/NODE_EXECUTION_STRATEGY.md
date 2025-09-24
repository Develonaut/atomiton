# Node Execution Strategy

## Executive Summary

Strategy for enabling node execution in the Atomiton platform. Phase 0
complete - storage package modernized with split exports. Phase 1 focuses on
events package and conductor integration.

## ✅ Completed Work

**Phase 0:**

1. **Storage Factory** - Split exports with `createStorage()`,
   `createFileSystemEngine()`, `createMemoryEngine()`
2. **Node Registry** - Direct usage of @atomiton/nodes package
3. **Storage-Conductor** - Desktop app persists to `{userData}/atomiton-data`

**Phase 1:** 4. **Events Package** - Split exports with `createEventBus()`, IPC
integration, functional factories

## 🟡 Active: Phase 1 - Enable Basic Execution

### ✅ Task 4: Modernize Events Package (COMPLETED)

- Replace singleton EventsAPI with `createEventManager()` ✅
- Add browser/desktop split exports ✅
- Consider async-first patterns (validate necessity) ✅

### Task 5: Initialize Conductor in Main Process (READY TO START)

- Setup conductor with storage integration
- Event-based IPC communication
- Error handling and logging

**🚀 PROMPT FOR TASK 5 - Initialize Conductor in Electron Main Process**

When ready to start this task, use this prompt:

> **"Implement Task 5 from the node execution strategy: Initialize Conductor in
> Main Process. This involves migrating the conductor package from raw Electron
> IPC to use @atomiton/events package, then setting up conductor initialization
> in the desktop app's main process. Please review the implementation guides in
> CONDUCTOR_INTEGRATION.md and DESKTOP_EVENT_BUS_USAGE.md, then follow the
> complete workflow in .claude/workflow/EXECUTION_PLAN.md to implement this
> integration."**

**Success Criteria:**

- [ ] Conductor package migrated to use @atomiton/events
- [ ] Desktop app initializes conductor in main process
- [ ] IPC communication replaced with event-based system
- [ ] All tests pass and functionality verified
- [ ] Ready for Task 6 (Execute Button in UI)

**Key Documents:**

- `/CONDUCTOR_INTEGRATION.md` - Complete migration guide
- `/DESKTOP_EVENT_BUS_USAGE.md` - Event bus patterns
- `/docs/architecture/ELECTRON_ARCHITECTURE.md` - Architecture context

### Task 6: Create Contract Verification Tests (BLOCKED)

- Main process execution contract tests
- Event bus integration contract tests
- End-to-end node execution validation
- Cross-environment contract verification

**🚀 PROMPT FOR TASK 6 - Contract Verification Integration Tests**

When ready to start this task, use this prompt:

> **"Implement Task 6 from the node execution strategy: Create Contract
> Verification Tests. This involves creating integration tests that verify both
> sides of the execution contract work independently - main process can execute
> nodes correctly, and renderer can send/receive proper requests. Focus on
> contract verification rather than IPC communication itself. Please follow the
> complete workflow in .claude/workflow/EXECUTION_PLAN.md to implement
> comprehensive integration tests."**

**Success Criteria:**

- [ ] Main process contract tests (can execute nodes and return results)
- [ ] Renderer process contract tests (can create requests and handle responses)
- [ ] Event bus integration tests (conductor events work properly)
- [ ] End-to-end node execution without IPC (local execution validation)
- [ ] All tests pass and contracts are verified
- [ ] Ready for Task 7 (Execute Button in UI)

### Task 7: Add Execute Button to UI (BLOCKED)

- Create execution trigger in editor toolbar
- Display basic execution results

## 📋 Roadmap

| Phase   | Goal                  | Duration | Status     |
| ------- | --------------------- | -------- | ---------- |
| Phase 0 | Storage modernization | Complete | ✅ DONE    |
| Phase 1 | Basic node execution  | 1-2 days | 🟡 ACTIVE  |
| Phase 2 | Real-time feedback    | 2-3 days | ⏸️ BLOCKED |
| Phase 3 | Production features   | 1 week   | ⏸️ BLOCKED |
| Phase 4 | Developer experience  | Ongoing  | ⏸️ BLOCKED |

## Critical Gaps

1. **Conductor Integration** - Not using @atomiton/events package
2. **Electron IPC** - Renderer can't trigger conductor

## Next Steps

**Immediate**: Initialize Conductor in Main Process (Phase 1, Task 5) **Then**:
Create Contract Verification Tests (Phase 1, Task 6) **Finally**: Add Execute
Button to UI (Phase 1, Task 7)

---

**Last Updated**: 2025-09-19 **Status**: Phase 1 In Progress
