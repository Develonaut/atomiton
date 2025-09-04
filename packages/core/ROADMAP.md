# Core Package Roadmap

## Vision

Transform the monolithic core package into a set of focused, single-responsibility packages that provide the foundation for the Atomiton platform.

## Current State (v0.1.0)

Single package containing:

- ✅ Event system (EventClient)
- ✅ Storage abstraction (FileSystem, IndexedDB, Memory)
- ✅ Execution clients (WebWorker, NodeProcess)
- ✅ State management (Zustand stores)
- ✅ Platform detection
- ⚠️ Tightly coupled components
- ❌ No dependency injection
- ❌ Limited test coverage

## Phase 1: Stabilization (September 2025)

**Goal**: Fix existing issues before decomposition

### Code Quality

- [ ] Resolve all TypeScript errors (~100+)
- [ ] Fix ESLint warnings (17 remaining)
- [ ] Update tests to match current API
- [ ] Achieve 60% test coverage

### Documentation

- [ ] Document all public APIs
- [ ] Add usage examples
- [ ] Create architecture diagrams

**Deliverables**: Stable v0.2.0 with clean build

## Phase 2: Package Decomposition (October 2025)

**Goal**: Split into focused packages

### New Package Structure

#### @atomiton/store

- Zustand-based state management
- Blueprint, execution, session, UI stores
- Store synchronization utilities

#### @atomiton/events

- EventClient implementation
- System event types
- Event subscription management
- Event replay/debugging

#### @atomiton/storage

- Storage abstraction interface
- FileSystemClient (Node.js)
- IndexedDBClient (Browser)
- MemoryClient (Testing)
- MonitoredStorageClient wrapper

#### @atomiton/execution

- Execution abstraction interface
- NodeProcessClient
- WebWorkerClient
- Process management utilities

#### @atomiton/platform

- Platform detection
- Capability detection
- Environment utilities

**Deliverables**: 5 new focused packages

## Phase 3: Dependency Injection (November 2025)

**Goal**: Enterprise-grade DI system

### Features

- [ ] Integrate with @atomiton/di package
- [ ] Service registration
- [ ] Lifecycle management
- [ ] Lazy loading support
- [ ] Testing utilities

**Deliverables**: DI-enabled packages

## Phase 4: Advanced Features (December 2025)

**Goal**: Production-ready features

### Enhancements

- [ ] Caching layer for storage
- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker pattern
- [ ] Performance monitoring
- [ ] Error boundaries

### Developer Experience

- [ ] CLI tools for package management
- [ ] Migration scripts
- [ ] Debugging utilities
- [ ] Performance profiler

**Deliverables**: Production-ready v1.0.0

## Phase 5: Optimization (Q1 2026)

**Goal**: Performance and scalability

### Performance

- [ ] Bundle size optimization (<5KB per package)
- [ ] Tree-shaking improvements
- [ ] Lazy loading strategies
- [ ] Memory optimization

### Scalability

- [ ] Clustering support
- [ ] Worker pool management
- [ ] Distributed storage
- [ ] Event streaming

**Deliverables**: Optimized packages

## Success Metrics

### Technical

- **Bundle Size**: < 5KB per package (gzipped)
- **Test Coverage**: > 90%
- **TypeScript Coverage**: 100%
- **Zero Runtime Errors**: Production stability

### Quality

- **API Stability**: No breaking changes after 1.0
- **Documentation**: 100% coverage
- **Performance**: < 10ms initialization
- **Memory**: < 10MB baseline

### Adoption

- **Internal Usage**: All Atomiton products
- **External Usage**: npm packages available
- **Community**: Active contributors

## Dependencies

### Technical

- TypeScript 5.0+
- Zustand 4.0+ (for store package)
- Node.js 18+ (for Node clients)

### Team

- Core team for decomposition
- DI team for integration
- QA for testing strategy

## Migration Strategy

### For Internal Use

1. Create new packages alongside core
2. Gradually move imports
3. Deprecate core exports
4. Remove core package

### For External Users

1. Publish new packages to npm
2. Provide migration guide
3. Support both patterns temporarily
4. Deprecation notices
5. Final migration deadline

## Risk Mitigation

### Technical Risks

- **Breaking changes**: Careful API design, beta testing
- **Performance regression**: Continuous benchmarking
- **Integration issues**: Comprehensive integration tests

### Process Risks

- **Timeline delays**: Phased approach, parallel work
- **Resource constraints**: Focus on MVP first
- **Scope creep**: Strict phase boundaries

---

**Status**: 🟡 Planning
**Owner**: Core Team
**Last Updated**: 2025-09-04
**Target Completion**: Q1 2026
