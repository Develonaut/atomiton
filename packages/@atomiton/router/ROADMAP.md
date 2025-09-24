# Roadmap - @atomiton/router

## Vision

Provide a clean, simplified wrapper around TanStack Router that eliminates
over-engineering while maintaining the benefits of type safety and React
integration.

## Current State (Complete ✅)

**Major Simplification**: Complete - Q4 2024 **Status**: Production Ready

- [x] Reduced codebase from ~1930 lines to 174 lines (91% reduction)
- [x] Eliminated over-engineered abstractions and custom state management
- [x] Clean wrapper around TanStack Router
- [x] Modular 4-file architecture
- [x] Type-safe component lazy loading
- [x] All quality checks passing (TypeScript, ESLint, tests, build)
- [x] Karen-approved as production-ready

## Future Considerations (Maintenance Focus)

**Philosophy**: Keep it simple. Only add features if absolutely necessary and
they maintain the simplified architecture.

### Potential Enhancements (Evaluate on demand)

- [ ] Additional TanStack Router hook exports as needed
- [ ] Enhanced TypeScript type inference for specific use cases
- [ ] Performance optimizations if bottlenecks are identified
- [ ] Error boundary improvements for better debugging

### Non-Goals

- ❌ Custom state management (use TanStack Router's built-in state)
- ❌ Complex middleware systems (keep routing simple)
- ❌ Over-engineered abstractions (maintain thin wrapper approach)
- ❌ Auto-generated navigation methods (TanStack Router API is sufficient)
- ❌ Custom navigation stores (leverage TanStack Router's state)

## Architecture

### Current Implementation (Simple & Stable)

- **TanStack Router**: Leverages TanStack Router as the foundation
- **Thin Wrapper**: Minimal abstraction layer for clean API
- **Type Safety**: Full TypeScript support with proper type exports
- **Component Loading**: Built-in lazy loading for route components

### File Structure (4 files, 174 lines total)

- `types.ts` - TypeScript type definitions
- `routeFactory.ts` - Route creation and component handling
- `createRouter.tsx` - Main router factory function
- `index.ts` - Public API exports

### Stability Commitment

This package follows a stability-first approach:

- **API Stability**: Minimal breaking changes
- **Dependency Management**: Keep TanStack Router up to date
- **Simple Maintenance**: Focus on bug fixes and compatibility

## Maintenance Plan

### Ongoing Responsibilities

- **Dependency Updates**: Keep TanStack Router up to date
- **Bug Fixes**: Address issues promptly while maintaining simplicity
- **TypeScript Updates**: Ensure compatibility with latest TypeScript versions
- **React Compatibility**: Support latest React versions and patterns

### Quality Standards

- **Code Coverage**: Maintain test coverage for core functionality
- **Performance**: Monitor bundle size and runtime performance
- **Documentation**: Keep README and examples current
- **Type Safety**: Ensure all public APIs are properly typed

## Success Metrics

### Simplicity Goals

- **Bundle Size**: Keep under 20KB gzipped
- **API Surface**: Maintain minimal public API
- **Complexity**: No increase in line count without compelling justification
- **Maintenance**: Low maintenance burden

### Quality Targets

- **TypeScript**: 100% type coverage for public APIs
- **Tests**: Core functionality covered with smoke tests
- **Performance**: Navigation performance matches TanStack Router baseline
- **Documentation**: Clear, concise documentation without bloat

---

**Maintained by**: Atomiton Core Team **Last Updated**: September 2025
**Status**: Simplified & Stable
