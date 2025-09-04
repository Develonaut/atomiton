# @atomiton/di

Lightweight dependency injection system for the Atomiton platform, based on n8n's proven DI implementation.

## 📊 Progress Tracking

- **[Current Work](./CURRENT.md)** - Active development tasks
- **[Upcoming Features](./NEXT.md)** - Planned improvements
- **[Release History](./COMPLETED.md)** - Completed features

## Overview

The DI package provides a lightweight dependency injection container that enables loose coupling, better testability, and modular architecture across the Atomiton platform. It's directly based on n8n's battle-tested DI implementation, which they created as a maintainable alternative to TypeDI.

## Attribution

This package is based on [@n8n/di](https://github.com/n8n-io/n8n/tree/master/packages/%40n8n/di). See [ATTRIBUTION.md](./ATTRIBUTION.md) for details.

## Features

### Core Capabilities

- **Service decorators** - Mark classes as injectable services
- **Automatic injection** - Resolve dependencies automatically
- **Lifecycle management** - Singleton, transient, and scoped instances
- **Lazy loading** - Services instantiated on demand
- **Testing utilities** - Mock injection for unit tests

### Design Patterns

- **Constructor injection** - Clean dependency declaration
- **Property injection** - Optional dependencies
- **Factory pattern** - Dynamic service creation
- **Service locator** - Central service registry

## Installation

```bash
pnpm add @atomiton/di
```

## Usage

### Basic Service Registration

```typescript
import { Service, Inject, Container } from "@atomiton/di";

// Define a service
@Service()
class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

// Use dependency injection
@Service()
class UserService {
  constructor(@Inject() private logger: LoggerService) {}

  createUser(name: string) {
    this.logger.log(`Creating user: ${name}`);
    // User creation logic
  }
}

// Get instance from container
const container = new Container();
const userService = container.get(UserService);
```

### Service Lifetimes

```typescript
// Singleton (default) - One instance for app lifetime
@Service({ lifetime: "singleton" })
class DatabaseService {}

// Transient - New instance every time
@Service({ lifetime: "transient" })
class RequestHandler {}

// Scoped - One instance per scope
@Service({ lifetime: "scoped" })
class SessionService {}
```

### Factory Pattern

```typescript
@Service()
class ConnectionFactory {
  create(config: Config): Connection {
    return new Connection(config);
  }
}

// Register factory
container.registerFactory(Connection, (factory: ConnectionFactory) => {
  return factory.create(config);
});
```

### Testing with DI

```typescript
// In tests, mock dependencies
class MockLogger extends LoggerService {
  log = jest.fn();
}

// Override service
container.override(LoggerService, MockLogger);

// Test with mocked dependency
const userService = container.get(UserService);
userService.createUser("test");
expect(mockLogger.log).toHaveBeenCalled();
```

## Architecture

```
packages/di/
├── src/
│   ├── container/      # DI container implementation
│   ├── decorators/     # Service & Inject decorators
│   ├── types/          # TypeScript interfaces
│   ├── lifecycle/      # Service lifetime management
│   ├── factory/        # Factory pattern support
│   └── testing/        # Test utilities
├── docs/               # Additional documentation
│   ├── PATTERNS.md     # Common DI patterns
│   └── README.md       # Domain documentation
└── tests/             # Test suites
```

## Integration with Atomiton

### Core Package

```typescript
@Service()
class StorageService {
  constructor(
    @Inject() private platform: PlatformService,
    @Inject() private events: EventService,
  ) {}
}
```

### Nodes Package

```typescript
@Service()
class NodeRegistry {
  constructor(
    @Inject() private validator: ValidationService,
    @Inject() private logger: LoggerService,
  ) {}
}
```

### Workflow Package

```typescript
@Service()
class WorkflowEngine {
  constructor(
    @Inject() private nodes: NodeRegistry,
    @Inject() private executor: ExecutionService,
  ) {}
}
```

## Comparison with n8n

### What n8n Does

- Complex DI with TypeDI
- Database repository injection
- Credential management via DI
- Worker process injection

### Our Approach

- Simpler, focused DI system
- Desktop-first service injection
- No database complexity
- Direct process execution

## Best Practices

1. **Keep services focused** - Single responsibility principle
2. **Use interfaces** - Program to interfaces, not implementations
3. **Avoid circular dependencies** - Use lazy injection if needed
4. **Test with mocks** - Always mock external dependencies
5. **Document dependencies** - Clear constructor signatures

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Roadmap

See detailed plans in [NEXT.md](./NEXT.md):

- TypeScript decorator metadata
- Async service initialization
- Service discovery
- Module system
- Advanced scoping

## Documentation

- [Patterns](./docs/PATTERNS.md) - Common DI patterns and recipes
- [Domain README](./docs/README.md) - Original domain documentation
- [API Reference](./docs/api/) - Complete API documentation

## Contributing

1. Follow existing patterns
2. Include comprehensive tests
3. Document public APIs
4. Maintain backward compatibility

## License

MIT - See [LICENSE](../../LICENSE) for details

---

**Package Status**: 🟡 Planning
**Version**: 0.1.0
**Stability**: Alpha
