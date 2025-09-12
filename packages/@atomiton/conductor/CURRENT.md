# Current Work - Conductor Package

## Sprint: January 11, 2025

### 🏗️ Package Setup - IN PROGRESS

**Active Tasks:**

- [ ] **Build configuration** - Set up TypeScript and build scripts
- [ ] **Core interfaces** - Define IExecutionEngine and IRuntime interfaces
- [ ] **Testing setup** - Configure Vitest for unit tests
- [ ] **ESLint config** - Add linting configuration

### 📋 Planning Phase - COMPLETE

**Completed January 11, 2025:**

- ✅ **Package created** - @atomiton/conductor structure established
- ✅ **Architecture documented** - Blueprint execution and runtime strategy
- ✅ **IPC strategy defined** - Integration with @atomiton/events
- ✅ **Storage format decided** - YAML for storage, JSON at runtime
- ✅ **MVP approach documented** - Pure TypeScript, no complexity

### 🔄 In Review

None

### ⚠️ Blocked

**Waiting on @atomiton/events IPC support:**

- Need IPC abstraction layer for renderer ↔ main communication
- Type-safe event definitions across process boundaries
- Automatic serialization/deserialization

## Notes

The conductor package orchestrates Blueprint and node execution. Starting with pure TypeScript implementation for MVP, with architecture designed to support future runtime flexibility through node versioning.

Key decisions:

- Desktop-first: Runs in Electron main process
- Storage: YAML files locally at ~/Atomiton/Blueprints/
- Queue: p-queue for in-memory task management
- IPC: Via @atomiton/events unified API

---

**Last Updated**: 2025-01-11
**Status**: 🟡 Setup Phase
**Next Milestone**: Basic execution of linear workflows (Week 1)
