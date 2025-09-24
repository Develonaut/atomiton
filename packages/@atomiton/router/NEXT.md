# Next Steps - @atomiton/router

## Immediate Priorities (Ongoing)

### 🎯 Primary Focus: Stability & Maintenance

The router package has been significantly simplified and is production-ready.
Focus is on maintaining stability and keeping dependencies up to date.

## Maintenance Tasks

### Short-term (Ongoing)

#### Core Maintenance

- [ ] **Dependency Updates**: Keep TanStack Router current with latest versions
- [ ] **React Compatibility**: Ensure compatibility with React version updates
- [ ] **TypeScript Updates**: Maintain compatibility with TypeScript releases
- [ ] **Bug Fixes**: Address any issues while maintaining simplicity

#### Quality Assurance

- [ ] **Test Maintenance**: Keep tests passing with dependency updates
- [ ] **Documentation Updates**: Keep README and examples current
- [ ] **Type Safety**: Ensure all public APIs remain properly typed
- [ ] **Performance Monitoring**: Monitor bundle size and runtime performance

### Evaluation Criteria for Future Changes

Any proposed enhancements must meet ALL of these criteria:

- [ ] **Necessity**: Is it absolutely essential for core routing functionality?
- [ ] **Simplicity**: Does it maintain the simplified architecture?
- [ ] **TanStack Router**: Can TanStack Router handle it natively instead?
- [ ] **Bundle Impact**: Does it keep the package under 20KB gzipped?

### Non-Goals (Explicitly Rejected)

- ❌ **Custom State Management**: Use TanStack Router's built-in state
- ❌ **Complex Middleware**: Keep routing simple and direct
- ❌ **Auto-generated Methods**: TanStack Router API is sufficient
- ❌ **Advanced Abstractions**: Maintain thin wrapper approach
- ❌ **Enterprise Features**: Complex features belong in application code

## Success Metrics

### Simplicity Goals

- **Bundle Size**: Keep under 20KB gzipped total
- **Line Count**: Maintain current ~174 lines across 4 files
- **Dependencies**: Minimal dependencies (TanStack Router + React only)
- **API Surface**: Keep public API focused and minimal

### Quality Standards

- **TypeScript**: 100% type coverage for public APIs
- **Tests**: Maintain passing tests with dependency updates
- **Performance**: Match TanStack Router's native performance
- **Documentation**: Keep docs accurate and concise

---

**Maintained by**: Atomiton Core Team **Last Updated**: September 2025
**Status**: Simplified & Stable
