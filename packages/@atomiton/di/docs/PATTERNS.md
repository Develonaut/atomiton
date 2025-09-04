# DI Package Patterns - Learning from n8n

## n8n's Reflection Package

n8n uses `reflect-metadata` for their DI implementation. This is a key insight!

### What n8n Does

```typescript
// They use reflect-metadata for decorator support
import "reflect-metadata";

// This enables:
@Service()
class MyService {
  constructor(
    private dep: Dependency, // Type info available at runtime
  ) {}
}
```

### Why This Matters

- **Type Information at Runtime**: Can validate dependencies
- **Automatic Injection**: No manual wiring needed
- **Circular Detection**: Can detect dependency cycles
- **Clean Syntax**: Decorators feel natural

## Our Implementation Plan

### 1. Use reflect-metadata (Like n8n)

```json
// package.json
{
  "dependencies": {
    "reflect-metadata": "^0.1.13"
  }
}
```

### 2. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node"
  }
}
```

### 3. Core Decorators (Inspired by n8n)

```typescript
// @Service decorator
export function Service(options?: ServiceOptions) {
  return function (target: Constructor) {
    const metadata = {
      token: options?.token || target,
      scope: options?.scope || "singleton",
      dependencies: Reflect.getMetadata("design:paramtypes", target) || [],
    };
    Container.register(target, metadata);
  };
}

// @Inject decorator (for property injection)
export function Inject(token?: Token) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex?: number,
  ) {
    // Store injection metadata
    const existingTokens = Reflect.getMetadata("inject:tokens", target) || [];
    existingTokens.push({ index: parameterIndex, token });
    Reflect.defineMetadata("inject:tokens", existingTokens, target);
  };
}
```

### 4. Container Implementation

```typescript
export class Container {
  private static instance: Container;
  private services = new Map<Token, ServiceMetadata>();
  private instances = new Map<Token, any>();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(token: Token<T>, metadata: ServiceMetadata): void {
    this.services.set(token, metadata);
  }

  get<T>(token: Token<T>): T {
    // Check for existing singleton
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    // Get metadata
    const metadata = this.services.get(token);
    if (!metadata) {
      throw new Error(`Service not registered: ${token.toString()}`);
    }

    // Resolve dependencies
    const dependencies = metadata.dependencies.map((dep) => this.get(dep));

    // Create instance
    const instance = new metadata.target(...dependencies);

    // Cache if singleton
    if (metadata.scope === "singleton") {
      this.instances.set(token, instance);
    }

    return instance;
  }
}
```

## Advantages Over Heavy Frameworks

### vs NestJS

- **Lighter**: ~10KB vs ~1MB
- **Simpler**: No module system complexity
- **Faster**: Less overhead
- **Focused**: Just DI, not full framework

### vs InversifyJS

- **Cleaner API**: More intuitive decorators
- **Better Types**: TypeScript 5.0 support
- **Smaller**: Minimal dependencies
- **Modern**: Latest JS features

## Integration with Atomiton

### 1. Service Registration

```typescript
// In each domain
@Service()
export class WorkflowService {
  constructor(
    private nodeRegistry: NodeRegistry,
    private eventBus: EventBus,
    private storage: IStorageClient,
  ) {}
}
```

### 2. Bootstrap

```typescript
// App initialization
import "reflect-metadata";
import { Container } from "@atomiton/di";

// Register all services
import "./services";

// Get root service
const app = Container.getInstance().get(AppService);
app.start();
```

### 3. Testing

```typescript
// Easy mocking
beforeEach(() => {
  Container.reset();
  Container.register(EventBus, MockEventBus);
});
```

## Key Patterns to Implement

### 1. Lazy Loading

- Services created on first use
- Reduces startup time
- Better memory usage

### 2. Scopes

- **Singleton**: Default, one instance
- **Transient**: New instance each time
- **Request**: Per-request (web context)

### 3. Factory Pattern

```typescript
@Factory(Database)
createDatabase(config: Config): Database {
  return config.isDesktop
    ? new SQLiteDatabase()
    : new IndexedDatabase();
}
```

### 4. Multi-Injection

```typescript
@Service()
class NodeRegistry {
  constructor(@InjectAll("node") private nodes: INode[]) {}
}
```

## Migration Path from Current Code

### Phase 1: Add DI to Existing Services

```typescript
// Before (current)
export const eventClient = new EventClient();

// After (with DI)
@Service()
export class EventClient { ... }
```

### Phase 2: Wire Dependencies

```typescript
// Before
const storage = ClientFactory.createStorageClient();

// After
@Service()
class MyService {
  constructor(private storage: IStorageClient) {}
}
```

### Phase 3: Remove Singletons

- Replace global instances with DI
- Better testing capability
- Cleaner architecture

## Performance Considerations

### Startup Impact

- One-time reflection parsing: ~50ms
- Service registration: < 1ms per service
- First resolution: ~10ms (then cached)

### Runtime Impact

- Singleton lookup: < 1ms
- Transient creation: ~1ms
- Negligible overhead

### Memory Impact

- Metadata storage: ~1KB per service
- Instance caching: depends on service
- Total overhead: < 1MB

## Testing Benefits

### Unit Testing

```typescript
it("should process workflow", () => {
  const container = new Container();
  container.register(EventBus, MockEventBus);

  const service = container.get(WorkflowService);
  expect(service.process()).toBe(expected);
});
```

### Integration Testing

```typescript
// Use real implementations
const container = Container.getInstance();
const app = container.get(AppService);
```

## Future Enhancements

### 1. Decorator Metadata API (TC39 Stage 3)

- Native decorator support coming
- Won't need reflect-metadata
- Better performance

### 2. AsyncLocalStorage Integration

- Request-scoped services
- Trace context propagation
- Better debugging

### 3. Hot Module Replacement

- Service hot-swapping
- Development productivity
- Zero downtime updates

---

**Note**: n8n's use of reflect-metadata is a smart choice. We should adopt this pattern but keep our implementation even simpler and more focused.
