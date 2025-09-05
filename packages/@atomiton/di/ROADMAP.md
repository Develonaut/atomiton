# @atomiton/di - Roadmap

## Overview

Dependency injection system for the Atomiton platform, providing IoC container functionality with TypeScript decorators.

## Current Architecture

- Lightweight DI container with reflection-based metadata
- Decorator-based service registration (`@Injectable`, `@Inject`)
- Singleton and transient lifecycle management
- Type-safe dependency resolution

## Upcoming Milestones

### Phase 1: Core Stabilization (Current)

- [ ] Complete basic DI container functionality
- [ ] Add comprehensive test coverage
- [ ] Optimize performance for large dependency graphs
- [ ] Improve error messages and debugging

### Phase 2: Advanced Features

- [ ] Circular dependency detection and resolution
- [ ] Factory and provider patterns
- [ ] Module-based dependency organization
- [ ] Async dependency resolution

### Phase 3: Platform Integration

- [ ] Integration with Blueprint node system
- [ ] Plugin architecture support
- [ ] Runtime service discovery
- [ ] Configuration-driven dependency setup

## Design Principles

- **Type Safety**: Full TypeScript support with compile-time checking
- **Performance**: Minimal overhead with lazy initialization
- **Simplicity**: Clean API that doesn't require extensive boilerplate
- **Testability**: Easy mocking and testing of dependencies

## Dependencies

- `reflect-metadata` - Reflection support for decorators
- Standard build tooling (Vite, TypeScript, Vitest)

## Future Considerations

- Potential migration to more mature DI solutions if complexity grows
- Integration with other platform packages (@atomiton/events, @atomiton/store)
- Documentation and examples for common patterns

---

_Last Updated: 2025-09-05_
