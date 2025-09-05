# Nodes Architecture - Technical Deep Dive

## Table of Contents

- [Core Abstractions](#core-abstractions)
  - [Node Package Interface](#1-node-package-interface)
  - [Separation of Concerns](#2-separation-of-concerns)
  - [Configuration Schema](#3-configuration-schema)
  - [Port System](#4-port-system)
- [Node Discovery and Registration](#node-discovery-and-registration)
- [Execution Model](#execution-model)
- [Integration with Core](#integration-with-core)
- [UI Integration](#ui-integration)
- [Event Flow](#event-flow)
- [Testing Strategy](#testing-strategy)
- [Performance Considerations](#performance-considerations)
- [Security Model](#security-model)
- [Future Considerations](#future-considerations)

## Core Abstractions

### 1. Node Package Interface

The `NodePackage` interface enforces a consistent structure for all nodes, ensuring clean separation between logic and presentation while maintaining cohesion through co-location.

```typescript
interface NodePackage<TConfig, TUIData> {
  // Core definition with metadata and port specifications
  definition: NodeDefinition;

  // Pure business logic - no UI dependencies
  logic: NodeLogic<TConfig>;

  // React component for visualization - no business logic
  ui: NodeUIComponent<TUIData>;

  // Shared configuration schema using Zod
  configSchema: z.ZodSchema<TConfig>;

  // Optional test utilities
  tests?: NodeTestSuite;

  // Package metadata for discovery and documentation
  metadata: NodeMetadata;
}
```

### 2. Node Definition

The node definition provides the contract for how a node integrates with the system:

```typescript
interface NodeDefinition {
  id: string; // Unique identifier
  name: string; // Display name
  category: string; // Organizational category
  type: string; // Runtime type identifier
  version?: string; // Semantic version

  // Port specifications
  inputPorts?: PortDefinition[]; // Input connections
  outputPorts?: PortDefinition[]; // Output connections

  // Execution function
  execute?: (
    context: NodeExecutionContext,
    config?: Record<string, unknown>,
  ) => Promise<NodeExecutionResult>;

  // UI configuration
  icon?: string; // Icon identifier
  defaultConfig?: Record<string, unknown>;
  configSchema?: Record<string, unknown>;
}
```

### 3. Port Definition

Ports define the data flow interface between nodes:

```typescript
interface PortDefinition {
  id: string; // Port identifier
  name: string; // Display name
  type: string; // 'input' | 'output'
  dataType: string; // Expected data type
  required?: boolean; // Required for execution
  multiple?: boolean; // Accept multiple connections
  description?: string; // Documentation
  defaultValue?: unknown; // Default if not connected
}
```

## Base Classes

### BaseNodeLogic

The `BaseNodeLogic` class provides a robust foundation for implementing node business logic:

```typescript
abstract class BaseNodeLogic<TConfig> {
  // Core execution - must be implemented
  abstract execute(
    context: NodeExecutionContext,
    config: TConfig
  ): Promise<NodeExecutionResult>;

  // Configuration management
  getDefaultConfig(): Partial<TConfig>
  validateConfig(config: unknown): config is TConfig

  // Input handling
  getInput<T>(context, portId, defaultValue?): T | undefined
  validateRequiredInputs(context, required[]): ValidationResult

  // Progress and logging
  reportProgress(context, progress, message?): void
  log(context, level, message, data?): void

  // Result creation
  createSuccessResult(outputs): NodeExecutionResult
  createErrorResult(error, metadata?): NodeExecutionResult

  // Utility methods
  shouldAbort(context): boolean
  withTimeout<T>(promise, timeoutMs, errorMessage?): Promise<T>
  retry<T>(operation, maxRetries?, baseDelayMs?): Promise<T>
  sanitizeString(input): string
  deepClone<T>(obj): T
}
```

### BaseNodePackage

The `BaseNodePackage` provides validation and utility methods:

```typescript
abstract class BaseNodePackage<TConfig, TUIData> {
  // Validate package structure
  validate(): { valid: boolean; errors: string[] };

  // Utility accessors
  getId(): string;
  getVersion(): string;
  isExperimental(): boolean;
  isDeprecated(): boolean;
}
```

## Registry System

### NodePackageRegistry

The registry manages node discovery, validation, and lifecycle:

```typescript
class NodePackageRegistry extends EventEmitter {
  // Registration
  register(package: NodePackage, filePath?: string): Promise<Entry>
  unregister(id: string): boolean

  // Discovery
  get(id: string): Entry | undefined
  getAll(): Entry[]
  getByCategory(category: string): Entry[]
  search(query: string): Entry[]

  // Filtering
  getAvailable(): Entry[]  // Valid, non-deprecated
  getExperimental(): Entry[]
  getDeprecated(): Entry[]

  // Validation
  validateAll(): Promise<ValidationReport>

  // Statistics
  getStats(): RegistryStats

  // Events
  on('package:registered', handler)
  on('package:validation-failed', handler)
  on('registry:ready', handler)
}
```

## Adapter Architecture

### Theme Injection Pattern

The adapter system uses dependency injection for theming, eliminating color duplication:

```typescript
interface AdapterTheme {
  // Dynamic color resolution
  getCategoryColor: (category: NodeCategory) => string;
  getPortColor: (dataType: DataType) => string;
  getStatusColor: (status: NodeStatus) => string;
  getConnectionColor: (status: ConnectionStatus) => string;

  // Base theme tokens
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  radius: BorderRadius;
  shadows: Shadows;
}
```

### Visualization Adapters

Adapters transform core node data for different visualization libraries:

```typescript
interface IVisualizationAdapter<TNode, TEdge> {
  // Node transformation
  nodeToVisual(node: VisualNodeInstance): TNode;
  visualToNode(visual: TNode): VisualNodeInstance;

  // Connection transformation
  connectionToVisual(connection: NodeConnection): TEdge;
  visualToConnection(visual: TEdge): NodeConnection;

  // Theme updates
  updateTheme(theme: AdapterTheme): void;

  // Batch operations
  batchTransform(nodes: VisualNodeInstance[]): TNode[];
}
```

## Type Safety Mechanisms

### 1. Zod Schema Validation

Configuration schemas provide runtime validation and TypeScript type inference:

```typescript
const configSchema = z.object({
  delimiter: z.string().default(","),
  hasHeaders: z.boolean().default(true),
  maxRows: z.number().min(1).optional(),
});

type Config = z.infer<typeof configSchema>;
```

### 2. Generic Constraints

Type parameters ensure consistency between components:

```typescript
class MyNode implements NodePackage<MyConfig, MyUIData> {
  // Config type flows through logic
  logic: NodeLogic<MyConfig>;

  // UI data type flows through component
  ui: NodeUIComponent<MyUIData>;

  // Schema matches config type
  configSchema: z.ZodSchema<MyConfig>;
}
```

### 3. Discriminated Unions

Result types use discriminated unions for type-safe error handling:

```typescript
type NodeExecutionResult =
  | { success: true; outputs: Record<string, unknown> }
  | { success: false; error: string; metadata?: Record<string, unknown> };
```

## Plugin Architecture Patterns

### 1. Node Discovery

Automatic discovery of node packages:

```typescript
class NodeDiscovery {
  async discover(patterns: string[]): Promise<NodePackage[]> {
    const files = await glob(patterns);
    const packages = [];

    for (const file of files) {
      const module = await import(file);
      if (isNodePackage(module.default)) {
        packages.push(module.default);
      }
    }

    return packages;
  }
}
```

### 2. Dynamic Loading

Lazy loading for performance:

```typescript
class LazyNodeLoader {
  private loaders = new Map<string, () => Promise<NodePackage>>();

  register(id: string, loader: () => Promise<NodePackage>) {
    this.loaders.set(id, loader);
  }

  async load(id: string): Promise<NodePackage> {
    const loader = this.loaders.get(id);
    if (!loader) throw new Error(`Node ${id} not found`);
    return await loader();
  }
}
```

### 3. Extension Points

Hooks for customization:

```typescript
interface NodeLifecycleHooks {
  beforeExecute?: (context: NodeExecutionContext) => Promise<void>;
  afterExecute?: (result: NodeExecutionResult) => Promise<void>;
  onError?: (error: Error) => Promise<void>;
  onAbort?: () => Promise<void>;
}
```

## Execution Model

### 1. Context Isolation

Each node executes in an isolated context:

```typescript
class NodeExecutor {
  async execute(
    node: NodePackage,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    // Create isolated context
    const isolatedContext = {
      ...context,
      tempDirectory: await createTempDir(),
      abortSignal: new AbortController().signal,
    };

    try {
      // Execute with timeout
      return await withTimeout(
        node.logic.execute(isolatedContext, config),
        context.limits.maxExecutionTimeMs,
      );
    } finally {
      // Cleanup
      await cleanupTempDir(isolatedContext.tempDirectory);
    }
  }
}
```

### 2. Resource Management

Enforce resource limits during execution:

```typescript
class ResourceManager {
  async executeWithLimits(
    fn: () => Promise<T>,
    limits: ResourceLimits,
  ): Promise<T> {
    const startMemory = process.memoryUsage();
    const timeout = setTimeout(() => {
      throw new Error("Execution timeout");
    }, limits.maxExecutionTimeMs);

    try {
      const result = await fn();

      // Check memory usage
      const endMemory = process.memoryUsage();
      const usedMemory = endMemory.heapUsed - startMemory.heapUsed;

      if (limits.maxMemoryMB && usedMemory > limits.maxMemoryMB * 1024 * 1024) {
        throw new Error("Memory limit exceeded");
      }

      return result;
    } finally {
      clearTimeout(timeout);
    }
  }
}
```

### 3. Progress Tracking

Real-time progress reporting:

```typescript
class ProgressTracker {
  private progress = new Map<string, number>();
  private listeners = new Set<ProgressListener>();

  report(nodeId: string, progress: number, message?: string) {
    this.progress.set(nodeId, progress);

    for (const listener of this.listeners) {
      listener({ nodeId, progress, message, timestamp: Date.now() });
    }
  }

  subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

## Best Practices

### 1. Node Implementation

- Keep logic pure and side-effect free where possible
- Use the base class utilities to reduce boilerplate
- Validate inputs early and fail fast with clear errors
- Report progress for long-running operations
- Handle abort signals gracefully

### 2. Configuration Design

- Use Zod schemas for runtime validation
- Provide sensible defaults
- Group related options
- Document each option clearly
- Consider presets for common configurations

### 3. Error Handling

- Use typed errors for different failure modes
- Include context in error messages
- Provide recovery suggestions
- Log errors with appropriate severity
- Preserve stack traces for debugging

### 4. Testing Strategy

- Unit test logic independently from UI
- Mock execution context for isolated testing
- Test error paths and edge cases
- Verify resource cleanup
- Benchmark performance-critical nodes

### 5. Documentation

- Document ports with clear descriptions
- Provide usage examples
- Explain configuration options
- Include troubleshooting guides
- Version changes carefully

## Performance Considerations

### 1. Streaming Support

For large data processing:

```typescript
interface StreamingNode {
  executeStream(
    context: NodeExecutionContext,
    config: TConfig,
  ): AsyncIterator<ChunkResult>;
}
```

### 2. Caching

Cache expensive computations:

```typescript
class CachedNode extends BaseNodeLogic {
  private cache = new LRUCache<string, Result>();

  async execute(context, config) {
    const cacheKey = this.getCacheKey(context.inputs, config);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.computeResult(context, config);
    this.cache.set(cacheKey, result);
    return result;
  }
}
```

### 3. Parallel Execution

Process data in parallel when possible:

```typescript
class ParallelProcessor extends BaseNodeLogic {
  async execute(context, config) {
    const items = this.getInput<Array>(context, "items");
    const batchSize = config.batchSize || 10;

    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((item) => this.processItem(item)),
      );
      results.push(...batchResults);

      this.reportProgress(context, (i / items.length) * 100);
    }

    return this.createSuccessResult({ results });
  }
}
```

## Security Considerations

### 1. Input Sanitization

Always sanitize user inputs:

```typescript
class SecureNode extends BaseNodeLogic {
  execute(context, config) {
    // Sanitize string inputs
    const input = this.sanitizeString(this.getInput(context, "userInput"));

    // Validate against schema
    const validated = schema.safeParse(input);
    if (!validated.success) {
      return this.createErrorResult("Invalid input");
    }

    // Process safely
    return this.processValidated(validated.data);
  }
}
```

### 2. Resource Limits

Enforce execution limits:

```typescript
const executionLimits = {
  maxExecutionTimeMs: 30000, // 30 seconds
  maxMemoryMB: 512, // 512 MB
  maxDiskSpaceMB: 1024, // 1 GB
  maxNetworkRequests: 100, // API rate limiting
};
```

### 3. Sandboxing

Execute untrusted code in isolation:

```typescript
class SandboxedExecutor {
  async execute(code: string, context: Context) {
    const vm = new VM({
      timeout: context.limits.maxExecutionTimeMs,
      sandbox: {
        // Limited API surface
        console: context.log,
        fetch: this.limitedFetch,
      },
    });

    return vm.run(code);
  }
}
```

## Future Enhancements

### 1. Visual Programming

- Node composition through visual grouping
- Subgraph encapsulation
- Template system for common patterns

### 2. AI Integration

- Automatic node suggestion based on context
- Natural language to node configuration
- Smart error recovery suggestions

### 3. Distributed Execution

- Node execution across multiple workers
- Cloud function deployment
- Edge computing support

### 4. Advanced Debugging

- Time-travel debugging
- Data flow visualization
- Performance profiling

### 5. Marketplace

- Community node sharing
- Version management
- Automated testing and validation
