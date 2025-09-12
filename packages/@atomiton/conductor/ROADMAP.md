# Conductor Package Roadmap

## Overview

Development roadmap for the @atomiton/conductor package - the orchestration engine for Blueprints and nodes.

## Phase 1: Foundation (Week 1-2)

### Week 1: Core Structure

- [x] Set up package build configuration
- [ ] Define core interfaces (IExecutionEngine, IRuntime)
- [ ] Create ExecutionEngine class
- [x] ~~**BlueprintSerializer class**~~ - _Migrated to @atomiton/storage_
- [x] ~~**BlueprintStorage class**~~ - _Migrated to @atomiton/storage_
- [ ] Set up testing infrastructure
- [ ] Integration with @atomiton/storage for Blueprint persistence

### Week 2: Basic Execution

- [ ] Implement sequential node execution
- [ ] Add data flow between nodes
- [ ] Create execution context management
- [ ] Add basic error handling
- [ ] Implement execution state tracking

**Deliverable**: Can execute simple linear workflows

## Phase 2: IPC & Integration (Week 3-4)

### Week 3: IPC Communication

- [ ] Integrate with @atomiton/events package
- [ ] Create IPCBridge for renderer ↔ main communication
- [ ] Implement execution commands (start, pause, cancel)
- [ ] Add execution progress events
- [ ] Set up bidirectional data flow

### Week 4: Blueprint Features

- [ ] Implement Blueprint-as-node execution
- [ ] Add nested Blueprint support
- [ ] Create execution history tracking
- [ ] Implement pause/resume functionality
- [ ] Add execution metrics collection

**Deliverable**: Full IPC integration, nested Blueprint support

## Phase 3: Performance & Polish (Week 5-6)

### Week 5: Optimization

- [ ] Add Worker Thread pool for parallel nodes
- [ ] Implement streaming for large data
- [ ] Add execution caching
- [ ] Optimize memory usage
- [ ] Add performance monitoring

### Week 6: Production Ready

- [ ] Comprehensive error recovery
- [ ] Add execution replay capability
- [ ] Implement rate limiting
- [ ] Add resource management
- [ ] Complete test coverage

**Deliverable**: Production-ready runtime

## Phase 4: Advanced Features (Future)

### Multi-Runtime Support (Post-MVP)

- [ ] Add runtime routing interface
- [ ] Implement WASM runtime for portable performance
- [ ] Add Rust node support via NAPI (if needed)
- [ ] Create Python runtime bridge (if needed)

### Cloud Features (Future)

- [ ] Add remote execution capability
- [ ] Implement distributed execution
- [ ] ~~Add cloud storage integration~~ - _Handled by @atomiton/storage package_
- [ ] Create execution clustering

## Success Metrics

### Phase 1

- Execute 10-node workflow in < 100ms overhead
- Pass all unit tests
- Zero memory leaks

### Phase 2

- IPC latency < 10ms
- Support 5-level Blueprint nesting
- Execution history with < 1MB per execution

### Phase 3

- Support 100+ concurrent executions
- Memory usage < 100MB for typical workflows
- 90% test coverage

## Technical Decisions

### MVP Choices

- **Language**: Pure TypeScript/Node.js
- **Queue**: p-queue (in-memory)
- **Storage**: @atomiton/storage package (universal abstraction)
- **IPC**: @atomiton/events with EventEmitter3

### Future Options

- **Performance**: Rust nodes via NAPI
- **Portability**: WebAssembly modules
- **Scale**: Redis queues, PostgreSQL storage

## Dependencies

### Required Packages

- @atomiton/nodes (node definitions)
- @atomiton/events (IPC communication)
- @atomiton/storage (Blueprint persistence and storage abstraction)
- p-queue (task queue)

### Development

- vitest (testing)
- TypeScript 5.x
- Node.js 20.x

## Risks & Mitigations

| Risk                    | Impact | Mitigation                              |
| ----------------------- | ------ | --------------------------------------- |
| IPC latency             | High   | Batch operations, use SharedArrayBuffer |
| Memory leaks            | High   | Strict cleanup, WeakMaps, testing       |
| Complex debugging       | Medium | Comprehensive logging, execution replay |
| Performance bottlenecks | Medium | Profile first, optimize later           |

## Notes

- Start simple, measure everything
- Optimize based on real usage data
- Keep backward compatibility via versioning
- Focus on developer experience

---

**Last Updated**: 2025-01-11  
**Status**: Foundation Phase - Storage Migration Complete
**Next Step**: Implement ExecutionEngine class for Blueprint orchestration
