# @atomiton/nodes

Node system for Atomiton Blueprint with strict browser/Node.js separation.

## Structure

```
src/
├── core/             # Core types and factories
├── definitions/      # Browser-safe node configurations
├── executables/      # Node.js runtime implementations
└── schemas/          # Shared schemas
```

## Usage

### Browser/Client (Definitions only)
```typescript
import {
  parallelDefinition,
  createNodeDefinition,
  getNodeDefinition
} from '@atomiton/nodes/node/definitions';
```

### Node.js/Runtime (Definitions + Executables)
```typescript
import {
  parallelDefinition,
  parallelExecutable,
  createNodeExecutable,
  getNodeExecutable
} from '@atomiton/nodes/node/executables';
```

## Available Nodes

- **parallel** - Parallel execution with concurrency control
- **csv-reader** - CSV file parsing
- **composite** - Workflow composition
- **image-composite** - Image processing
- **http-request** - HTTP/API requests
- **file-system** - File operations
- **transform** - Data transformation
- **shell-command** - System commands
- **loop** - Iteration operations

## Key Features

- **Strict separation** between browser and Node.js code
- **Factory functions** exposed for custom node creation
- **Registry pattern** for node discovery
- **Type-safe** with full TypeScript support