# Nodes Domain - Blueprint Building Blocks

## Overview

The nodes domain provides the foundational building blocks for the Blueprint automation system. Each node represents a discrete unit of functionality that can be connected to form complex workflows. This domain emphasizes quality over quantity, desktop-first capabilities, and elegant simplicity.

## Current Architecture Analysis

### Strengths

1. **Clean Separation of Concerns**
   - Logic and UI components are cleanly separated but co-located
   - Node packages follow a consistent structure with definition, logic, UI, and config schema
   - Type-safe configuration through Zod schemas

2. **Robust Base Classes**
   - `BaseNodeLogic` provides excellent utilities (timeout, retry, validation, sanitization)
   - Helper methods reduce boilerplate while maintaining flexibility
   - Progress reporting and logging built into the foundation

3. **Registry Pattern**
   - Well-designed registry with validation, search, and categorization
   - Event-driven architecture for monitoring changes
   - Support for experimental and deprecated nodes

4. **Adapter System**
   - Theme injection pattern eliminates color duplication
   - Vendor-agnostic visualization adapters
   - Easy switching between React Flow, Cytoscape, and other libraries

### Areas for Enhancement

1. **Limited Node Implementations**
   - Currently only CSV Parser is implemented
   - Need 20-50 essential nodes for a complete system

2. **Testing Infrastructure**
   - Test suite interface defined but not utilized
   - Need comprehensive testing patterns for nodes

3. **Documentation**
   - Node packages lack inline documentation
   - Missing developer guide for creating new nodes

4. **Desktop Integration**
   - File system access patterns not established
   - Local execution capabilities not leveraged

## Comparison with n8n

### What n8n Does Well

1. **Extensive Node Library** - 500+ integrations provide broad coverage
2. **Consistent Interface** - Predictable node behavior and configuration
3. **Error Handling** - Robust error recovery and retry mechanisms
4. **Credential Management** - Secure handling of API keys and secrets

### Our Differentiation

1. **Quality Over Quantity**
   - 20-50 excellent nodes vs 500+ mediocre ones
   - Each node is carefully crafted and thoroughly tested
   - Focus on common automation needs, not edge cases

2. **Desktop-First Capabilities**
   - Direct file system access without restrictions
   - Local process execution and system integration
   - No cloud dependency or limitations

3. **AI-Native Integration**
   - Nodes designed for AI workflows from the ground up
   - Streaming support for real-time AI processing
   - Context-aware execution with semantic understanding

4. **Developer Experience**
   - TypeScript-first with full type safety
   - Co-located logic and UI for maintainability
   - Clear patterns for extending functionality

## Node Categories

### 1. Input/Output (5-7 nodes)

- **File Reader** - Read files with encoding detection
- **File Writer** - Write files with atomic operations
- **Directory Scanner** - Traverse and filter directory contents
- **HTTP Request** - Make API calls with retry logic
- **Webhook Receiver** - Accept incoming HTTP requests
- **Database Query** - Connect to SQL/NoSQL databases

### 2. Data Processing (8-10 nodes)

- **JSON Transform** - JSONPath queries and transformations
- **CSV Parser** ✅ - Parse and validate CSV data
- **Excel Processor** - Read/write Excel with formulas
- **Text Processor** - Regex, replace, split operations
- **Data Mapper** - Transform between data structures
- **Array Operations** - Filter, map, reduce, sort
- **Data Validator** - Schema validation with detailed errors
- **Merge Data** - Combine multiple data sources

### 3. AI & LLM (5-7 nodes)

- **LLM Chat** - Interact with language models
- **Text Embedding** - Generate semantic embeddings
- **Vector Search** - Similarity search in vector stores
- **Image Analysis** - Computer vision operations
- **Speech to Text** - Audio transcription
- **Code Interpreter** - Execute code in sandboxed environment

### 4. Control Flow (4-5 nodes)

- **Conditional** - If/else branching logic
- **Loop** - Iterate over arrays or ranges
- **Switch** - Multi-way branching
- **Wait** - Delay or schedule execution
- **Error Handler** - Catch and handle errors

### 5. System Integration (5-7 nodes)

- **Shell Command** - Execute system commands
- **Process Monitor** - Watch system processes
- **Environment Variables** - Read/write env vars
- **Git Operations** - Clone, commit, push
- **Docker Control** - Manage containers
- **Schedule Trigger** - Cron-based activation

### 6. Utilities (4-5 nodes)

- **Logger** - Structured logging with levels
- **Notification** - Send alerts via various channels
- **Cache** - Store and retrieve temporary data
- **Metrics Collector** - Gather performance data
- **Debug Inspector** - Examine data flow

## Integration Points

### With Core Domain

- Nodes implement the execution interface defined in core
- Core provides the runtime context and execution engine
- Node definitions are consumed by the core Blueprint system

### With Workflow Domain

- Workflows orchestrate node execution
- Node connections define data flow
- Workflow validation ensures node compatibility

### With Editor Domain

- Editor renders nodes using the adapter system
- Node UI components integrate with the editor canvas
- Configuration forms generated from schemas

### With Runtime Domain

- Runtime executes node logic in isolated contexts
- Resource limits enforced during execution
- Progress and logs streamed to UI

## Technical Implementation

### Node Package Structure

```typescript
interface NodePackage<TConfig, TUIData> {
  definition: NodeDefinition; // Metadata and ports
  logic: NodeLogic<TConfig>; // Business logic
  ui: NodeUIComponent<TUIData>; // React component
  configSchema: z.ZodSchema; // Configuration schema
  tests?: NodeTestSuite; // Optional test suite
  metadata: {
    version: string;
    author: string;
    description: string;
    keywords: string[];
    icon: string;
  };
}
```

### Execution Context

```typescript
interface NodeExecutionContext {
  nodeId: string;
  inputs: Record<string, unknown>;
  config?: Record<string, unknown>;
  workspaceRoot?: string;
  tempDirectory?: string;
  limits: {
    maxExecutionTimeMs: number;
    maxMemoryMB?: number;
  };
  reportProgress: (progress: number, message?: string) => void;
  log: LogFunctions;
  abortSignal?: AbortSignal;
}
```

## Development Roadmap

### Phase 1: Foundation (Current)

- ✅ Base architecture established
- ✅ Registry and adapter systems
- ✅ CSV Parser implementation
- ⏳ Testing patterns

### Phase 2: Essential Nodes (Next)

- [ ] File I/O nodes
- [ ] Data processing nodes
- [ ] Basic control flow
- [ ] HTTP/Webhook nodes

### Phase 3: AI Integration

- [ ] LLM interaction nodes
- [ ] Embedding and vector nodes
- [ ] Streaming support
- [ ] Context management

### Phase 4: Desktop Power

- [ ] System integration nodes
- [ ] Process control nodes
- [ ] Local database nodes
- [ ] File system watchers

### Phase 5: Polish

- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Developer documentation
- [ ] Example blueprints

## Design Principles

1. **Simplicity First** - Each node does one thing well
2. **Type Safety** - Full TypeScript coverage with strict types
3. **Error Resilience** - Graceful degradation and clear error messages
4. **Performance** - Streaming support and efficient memory usage
5. **Extensibility** - Clear patterns for custom nodes
6. **Desktop Power** - Leverage local capabilities fully
7. **AI Native** - Built for AI workflows from the ground up

## Success Metrics

- **Quality**: Zero runtime errors in production nodes
- **Performance**: Sub-100ms execution for basic operations
- **Coverage**: 20-50 nodes covering 80% of use cases
- **Developer Experience**: New node creation in < 30 minutes
- **Testing**: 100% test coverage for node logic
- **Documentation**: Every node fully documented with examples

## Conclusion

The nodes domain is well-architected with strong foundations. The focus now should be on implementing the essential node library while maintaining the high quality bar established by the current architecture. By prioritizing desktop-first capabilities and AI-native integration, we can create a node system that is both powerful and approachable.
