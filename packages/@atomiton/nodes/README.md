# @atomiton/nodes

Node implementations providing the building blocks for visual automation workflows. Features unified node architecture where both atomic and composite nodes implement the same INode interface.

## 📊 Progress Tracking

- **[Current Work](./docs/status/CURRENT.md)** - Active development tasks
- **[Upcoming Features](./docs/planning/NEXT.md)** - Planned nodes and improvements
- **[Release History](./docs/status/COMPLETED.md)** - Completed features

## Overview

The nodes package provides a carefully curated set of high-quality nodes for the Atomiton automation platform. We prioritize quality over quantity, focusing on 20-50 essential nodes that cover 80% of automation use cases rather than hundreds of mediocre integrations.

## 🏗️ Unified Node Architecture

All nodes implement the same `INode` interface, whether they are:

- **Atomic Nodes**: Individual functionality (CSV Reader, HTTP Request, Transform)
- **Composite Nodes**: Orchestrate other nodes (workflows, complex processes)

This unified approach enables powerful composition patterns and seamless interoperability. See [Unified Architecture Documentation](./docs/architecture/UNIFIED_ARCHITECTURE.md) for details.

## Features

### Core Capabilities

- **Type-safe node definitions** with Zod schema validation
- **Enhanced configuration system** with automatic form generation
- **13 supported form control types** (text, number, boolean, select, file, etc.)
- **UI metadata system** for rich property panels
- **Desktop-first design** with full file system access
- **AI-native integration** for LLM and embedding workflows
- **Streaming support** for real-time data processing
- **Visual theming** through adapter pattern

### Node Categories

#### Input/Output (5-7 nodes)

- File Reader - Read files with encoding detection
- File Writer - Atomic file operations
- Directory Scanner - Traverse directories
- HTTP Request - API calls with retry
- Webhook Receiver - Incoming HTTP

#### Data Processing (8-10 nodes)

- JSON Transform - JSONPath queries
- CSV Parser ✅ - Parse and validate CSV
- Excel Processor - Read/write Excel
- Text Processor - Regex operations
- Data Mapper - Structure transforms

#### AI & LLM (5-7 nodes)

- LLM Chat - Language model interaction
- Text Embedding - Semantic embeddings
- Vector Search - Similarity search
- Image Analysis - Computer vision
- Speech to Text - Audio transcription

#### Control Flow (4-5 nodes)

- Conditional - If/else branching
- Loop - Array iteration
- Switch - Multi-way branching
- Wait - Delays and scheduling
- Error Handler - Error recovery

#### System Integration (5-7 nodes)

- Shell Command - System execution
- Process Monitor - Process watching
- Git Operations - Version control
- Docker Control - Container management
- Schedule Trigger - Cron activation

## Installation

```bash
pnpm add @atomiton/nodes
```

## Usage

### Using Any Node (Atomic or Composite)

```typescript
import { nodes } from "@atomiton/nodes";

// Execute any node through unified interface
const node = await nodes.getNode("csv-reader");
const result = await node.execute({
  nodeId: "csv-1",
  inputs: { csv: csvData },
  config: { hasHeader: true },
});

// Works the same for composite nodes (workflows)
const composite = await nodes.getNode("data-pipeline");
const pipelineResult = await composite.execute({
  nodeId: "pipeline-1",
  inputs: { sourceData: data },
  config: { outputFormat: "json" },
});
```

### Creating Nodes with Factory API

```typescript
import { nodes } from "@atomiton/nodes";

// Use extendNode() factory instead of classes
const customNode = nodes.extendNode({
  type: "custom-transformer",
  category: "data",
  inputs: [{ name: "data", type: "any" }],
  outputs: [{ name: "result", type: "any" }],

  async execute(context) {
    // Custom logic here
    return { success: true, data: transformed };
  },
});
```

### Advanced Node Configuration

```typescript
import { nodes } from "@atomiton/nodes";
import { z } from "zod";

// Create nodes with rich configuration schemas
const advancedNode = nodes.extendNode({
  type: "api-client",
  category: "integration",

  // Zod schema for configuration
  configSchema: z.object({
    apiUrl: z.string().url().describe("API endpoint"),
    timeout: z.number().min(1000).max(30000).default(5000),
    retries: z.number().min(0).max(5).default(3),
    enabled: z.boolean().default(true),
  }),

  inputs: [{ name: "data", type: "any" }],
  outputs: [{ name: "response", type: "any" }],

  async execute(context) {
    const { inputs, config } = context;

    if (!config.enabled) {
      return { success: true, data: { skipped: true } };
    }

    const response = await fetch(config.apiUrl, {
      method: "POST",
      body: JSON.stringify(inputs.data),
      timeout: config.timeout,
    });

    return { success: true, data: await response.json() };
  },
});
```

## Architecture

```
packages/nodes/
├── src/
│   ├── base/           # Base classes and interfaces
│   ├── registry/       # Node registry system
│   ├── adapters/       # Visualization adapters
│   ├── nodes/          # Node implementations
│   │   ├── io/        # Input/output nodes
│   │   ├── data/      # Data processing
│   │   ├── ai/        # AI/LLM nodes
│   │   ├── flow/      # Control flow
│   │   └── system/    # System integration
│   └── utils/          # Shared utilities
├── docs/               # Additional documentation
│   ├── ARCHITECTURE.md # System design
│   ├── DEVELOPER_GUIDE.md # Node creation guide
│   └── COMPARISON.md  # vs n8n analysis
└── tests/             # Test suites
```

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

## Testing

Each node includes comprehensive tests:

```bash
# Run all tests
pnpm test

# Test specific node
pnpm test csv-parser

# Test with coverage
pnpm test:coverage
```

## Design Principles

1. **Quality Over Quantity** - 20-50 excellent nodes vs 500+ mediocre ones
2. **Desktop-First** - Leverage local file system and process capabilities
3. **Type Safety** - Full TypeScript coverage with strict types
4. **Rich Configuration** - Declarative schemas with automatic UI generation
5. **Developer Experience** - Intelligent form controls and validation
6. **AI-Native** - Built for AI workflows from the ground up
7. **Error Resilience** - Graceful degradation and clear error messages
8. **Performance** - Streaming support and efficient memory usage

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed plans including:

- Essential node implementations
- AI/LLM integration nodes
- Desktop-specific capabilities
- Testing and documentation

## Documentation

- **Architecture**
  - [Unified Architecture](./docs/architecture/UNIFIED_ARCHITECTURE.md) - Current unified INode architecture
  - [Architecture Comparison](./docs/architecture/COMPARISON.md) - How we differ from n8n
  - [Legacy Architecture](./docs/architecture/LEGACY_ARCHITECTURE.md) - Previous implementation
- **Development**
  - [Developer Guide](./docs/development/DEVELOPER_GUIDE.md) - Creating custom nodes
- **Status & Planning**
  - [Current Work](./CURRENT.md) - Active development tasks
  - [Completed Work](./COMPLETED.md) - Release history
  - [Roadmap](./ROADMAP.md) - Detailed development plan
- **Reference**
  - [Changelog](./CHANGELOG.md) - Version history

## Contributing

We welcome contributions! Please:

1. Focus on quality over quantity
2. Include comprehensive tests
3. Document thoroughly
4. Follow existing patterns

## License

MIT - See [LICENSE](../../LICENSE) for details

---

**Package Status**: 🟡 Active Development
**Version**: 0.1.0
**Stability**: Alpha
