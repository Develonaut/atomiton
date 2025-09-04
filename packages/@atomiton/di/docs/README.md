# @atomiton/di - Dependency Injection Domain

## Overview

Lightweight dependency injection system inspired by n8n's brilliant DI package. Uses TypeScript decorators for service registration and provides a simple container for dependency resolution. This is the foundation that enables our modular, testable architecture.

## Why DI? (Learning from n8n)

n8n's DI package is one of their best architectural decisions:

- **No heavy frameworks** - Not NestJS, not InversifyJS
- **Simple decorators** - Clean, readable service definitions
- **Type-safe** - Full TypeScript support with inference
- **Testable** - Easy to mock services for testing
- **Minimal overhead** - < 10KB runtime cost

## Core Concepts

### Service Registration

```typescript
@Service()
export class WorkflowService {
  constructor(
    private nodeRegistry: NodeRegistry,
    private eventBus: EventBus,
  ) {}
}
```

### Container Resolution

```typescript
const container = Container.getInstance();
const workflowService = container.get(WorkflowService);
```

### Scoped Instances

```typescript
@Service({ scope: 'singleton' })  // Default
@Service({ scope: 'transient' })  // New instance each time
@Service({ scope: 'request' })    // Per-request (web context)
```

## Architecture

```typescript
// Core interfaces (inspired by n8n)
interface ServiceMetadata {
  target: Constructor;
  scope: "singleton" | "transient" | "request";
  dependencies: Constructor[];
}

interface Container {
  register<T>(token: Token<T>, provider: Provider<T>): void;
  get<T>(token: Token<T>): T;
  has(token: Token): boolean;
  reset(): void;
}
```

## Key Features

### 1. Decorator-Based (Like n8n)

- `@Service()` - Register a service
- `@Inject()` - Inject a dependency
- `@InjectAll()` - Inject all implementations
- `@Optional()` - Optional dependency

### 2. Multiple Containers

- Global container for app-wide services
- Scoped containers for isolation
- Test containers for unit testing

### 3. Circular Dependency Detection

- Compile-time detection where possible
- Runtime detection with clear errors
- Dependency graph visualization

### 4. Lazy Loading

- Services instantiated on first use
- Reduces startup time
- Better memory efficiency

## Implementation Plan

### Phase 1: Core DI (Week 1)

- [ ] Basic container implementation
- [ ] @Service decorator
- [ ] Constructor injection
- [ ] Singleton scope

### Phase 2: Advanced Features (Week 2)

- [ ] Property injection
- [ ] Method injection
- [ ] Transient & request scopes
- [ ] Factory providers

### Phase 3: Developer Experience (Week 3)

- [ ] Circular dependency detection
- [ ] Debug mode with dependency graph
- [ ] VS Code extension for navigation
- [ ] Performance profiling

### Phase 4: Integration (Week 4)

- [ ] Integration with other domains
- [ ] Testing utilities
- [ ] Documentation generator
- [ ] Migration guide from n8n

## Usage Examples

### Basic Service

```typescript
@Service()
export class EmailService {
  async send(to: string, subject: string): Promise<void> {
    // Implementation
  }
}
```

### Service with Dependencies

```typescript
@Service()
export class NotificationService {
  constructor(
    private email: EmailService,
    private sms: SMSService,
    @Optional() private push?: PushService,
  ) {}
}
```

### Factory Pattern

```typescript
@Service()
export class DatabaseFactory {
  @Factory(Database)
  create(config: DatabaseConfig): Database {
    return new SQLiteDatabase(config);
  }
}
```

## Comparison with n8n

| Feature            | n8n DI                     | @atomiton/di                  |
| ------------------ | -------------------------- | ----------------------------- |
| Decorators         | ✅ TypeScript experimental | ✅ TypeScript 5.0 native      |
| Type Safety        | ✅ Good                    | ✅ Better with newer TS       |
| Bundle Size        | ~15KB                      | Target < 10KB                 |
| Scopes             | Singleton only             | Singleton, Transient, Request |
| Circular Detection | Runtime                    | Compile + Runtime             |
| Debug Tools        | Basic                      | Advanced with visualization   |

## Performance Targets

- **Container.get()**: < 1ms for cached instances
- **First instantiation**: < 10ms for complex services
- **Memory overhead**: < 1KB per service
- **Bundle size**: < 10KB minified + gzipped

## Testing Strategy

### Unit Tests

```typescript
describe("Container", () => {
  it("should resolve singleton services", () => {
    const service1 = container.get(TestService);
    const service2 = container.get(TestService);
    expect(service1).toBe(service2);
  });
});
```

### Integration Tests

- Test with real services
- Verify dependency chains
- Check scope isolation

## Migration from n8n

For teams migrating from n8n:

1. **Similar API** - Decorators work the same way
2. **Better types** - Improved TypeScript inference
3. **More scopes** - Not just singletons
4. **Smaller bundle** - Less overhead

## Dependencies

- `reflect-metadata` - For decorator metadata
- TypeScript 5.0+ - For native decorators

## Best Practices

1. **Register early** - Services at app startup
2. **Avoid circular deps** - Use interfaces
3. **Keep services focused** - Single responsibility
4. **Test with mocks** - Use test containers
5. **Document dependencies** - Clear service contracts

## Next Steps

1. Implement basic container
2. Add @Service decorator
3. Create test suite
4. Write migration guide
5. Build VS Code extension

---

**Status**: 🔴 Not Started  
**Priority**: Critical (Foundation)  
**Estimated**: 4 weeks  
**Dependencies**: None (foundation package)
