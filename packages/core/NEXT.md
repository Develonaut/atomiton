# Next Work Queue - @atomiton/core

## Priority 1 - Critical

### Package Decomposition

Break up monolithic core into focused packages:

- [ ] Extract `@atomiton/store` - State management with Zustand
- [ ] Extract `@atomiton/events` - Event system (EventClient)
- [ ] Extract `@atomiton/storage` - Storage abstraction layer
- [ ] Extract `@atomiton/execution` - Execution clients
- [ ] Extract `@atomiton/platform` - Platform detection

### Code Quality

- [ ] Resolve all TypeScript errors
- [ ] Fix ESLint warnings
- [ ] Achieve 80% test coverage

## Priority 2 - Important

### API Improvements

- [ ] Add dependency injection pattern
- [ ] Implement proper error boundaries
- [ ] Add retry logic to storage clients
- [ ] Improve TypeScript generics

### Documentation

- [ ] Document all public APIs
- [ ] Add architecture decision records
- [ ] Create usage examples

## Priority 3 - Nice to Have

### Performance

- [ ] Add caching layer
- [ ] Optimize bundle size
- [ ] Add performance monitoring

## Ideas Backlog

- WebAssembly integration for heavy computation
- Plugin system for extending core
- GraphQL client for API communication
- Real-time collaboration features

---

**Last Updated**: 2025-09-04
**Next Review**: 2025-09-11
