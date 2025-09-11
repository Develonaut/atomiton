# @atomiton/nodes

Blueprint node implementations providing the building blocks for visual automation workflows.

## 📊 Progress Tracking

- **[Current Work](./CURRENT.md)** - Active development tasks
- **[Upcoming Features](./NEXT.md)** - Planned nodes and improvements
- **[Release History](./COMPLETED.md)** - Completed features

## Overview

The nodes package provides a carefully curated set of high-quality nodes for the Atomiton Blueprint automation platform. We prioritize quality over quantity, focusing on 20-50 essential nodes that cover 80% of automation use cases rather than hundreds of mediocre integrations.

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

### Using a Node

```typescript
import { csvParser } from "@atomiton/nodes";

const result = await csvParser.logic.execute({
  nodeId: "csv-1",
  inputs: { csv: csvData },
  config: { hasHeader: true },
});
```

### Registering Nodes

```typescript
import { NodeRegistry } from "@atomiton/nodes";
import { csvParser, jsonTransform } from "@atomiton/nodes";

const registry = new NodeRegistry();
registry.register(csvParser);
registry.register(jsonTransform);
```

### Creating Custom Nodes with Enhanced Configuration

```typescript
import { BaseNodeLogic, NodePackage, NodeConfig } from "@atomiton/nodes";
import { z } from "zod";

// Enhanced configuration with UI metadata
class MyNodeConfig extends NodeConfig {
  static readonly schema = z.object({
    apiUrl: z.string().url().describe("API endpoint"),
    timeout: z.number().min(1000).max(30000).default(5000),
    retries: z.number().min(0).max(5).default(3),
    enabled: z.boolean().default(true),
  });

  static readonly defaults = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3,
    enabled: true,
  };

  // Fields configuration for automatic form generation
  static readonly fields = {
    apiUrl: {
      label: "API URL",
      type: "url",
      placeholder: "https://api.example.com/endpoint",
      description: "The API endpoint to call",
    },
    timeout: {
      label: "Timeout (ms)",
      type: "number",
      min: 1000,
      max: 30000,
      step: 1000,
      description: "Request timeout in milliseconds",
    },
    retries: {
      label: "Max Retries",
      type: "number",
      min: 0,
      max: 5,
      description: "Number of retry attempts",
    },
    enabled: {
      label: "Enable API Calls",
      type: "boolean",
      description: "Enable or disable API requests",
    },
  };

  constructor() {
    super(MyNodeConfig.schema, MyNodeConfig.defaults, MyNodeConfig.fields);
  }
}

type MyNodeConfigType = z.infer<typeof MyNodeConfig.schema>;

class MyNodeLogic extends BaseNodeLogic<MyNodeConfigType> {
  async execute(context: NodeExecutionContext) {
    const { inputs, config } = context;
    // Implementation with type-safe config
    if (!config.enabled) {
      return this.createSuccessResult({ skipped: true });
    }

    const response = await fetch(config.apiUrl, {
      timeout: config.timeout,
    });

    return this.createSuccessResult({ data: await response.json() });
  }
}

export const myNode: NodePackage = {
  definition: {
    type: "my-node",
    category: "custom",
    inputs: [{ name: "input", type: "any" }],
    outputs: [{ name: "output", type: "any" }],
  },
  logic: new MyNodeLogic(),
  config: new MyNodeConfig(), // Enhanced configuration
  ui: MyNodeUI,
};
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

See [ROADMAP.md](./docs/ROADMAP.md) for detailed plans including:

- Essential node implementations
- AI/LLM integration nodes
- Desktop-specific capabilities
- Testing and documentation

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and patterns
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Creating custom nodes
- [Comparison](./docs/COMPARISON.md) - How we differ from n8n
- [API Reference](./docs/api/) - Complete API documentation

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
