---
title: "@atomiton/nodes"
description:
  "A unified node system for Atomiton with strict browser/Node.js separation."
stage: "alpha"
version: "0.4.0"
last_updated: "2025-09-28"
dependencies: []
tags: []
ai_context:
  category: "framework"
  complexity: "complex"
  primary_language: "typescript"
---

# @atomiton/nodes

A unified node system for Atomiton with strict browser/Node.js separation.

## Installation

```bash
npm install @atomiton/nodes
```

## Overview

Everything is a node. Nodes can:

- Execute business logic
- Contain other nodes (forming groups)
- Connect to other nodes via edges
- Be serialized to/from YAML for storage

## Usage

### Browser (Definitions Only)

```typescript
import {
  getNodeDefinition,
  getAllNodeDefinitions,
} from "@atomiton/nodes/definitions";

// Get a specific node
const httpNode = getNodeDefinition("http-request");

// Get all available nodes
const allNodes = getAllNodeDefinitions();
```

### Desktop/Server (Full Functionality)

```typescript
import { getNodeExecutable } from "@atomiton/nodes/executables";
import { getNodeDefinition } from "@atomiton/nodes/definitions";

// Get both definition and executable
const definition = getNodeDefinition("http-request");
const executable = getNodeExecutable("http-request");

// Execute a node
const context = {
  nodeId: "http-1",
  inputs: { url: "https://api.example.com" },
  parameters: { method: "GET" },
};

const result = await executable.execute(context);
```

## Available Nodes

| Node              | Description            | Category |
| ----------------- | ---------------------- | -------- |
| `http-request`    | Make HTTP/API requests | IO       |
| `csv-reader`      | Parse CSV files        | IO       |
| `file-system`     | File operations        | IO       |
| `transform`       | Data transformation    | Data     |
| `code`            | Execute JavaScript     | Logic    |
| `loop`            | Iterate over arrays    | Logic    |
| `parallel`        | Parallel execution     | Logic    |
| `image-processor` | Image manipulation     | Media    |
| `shell-command`   | System commands        | System   |

## Creating Custom Nodes

```typescript
import { createNodeDefinition, createNodeExecutable } from "@atomiton/nodes";

// Define the node interface
const definition = createNodeDefinition({
  id: "my-node",
  name: "My Node",
  metadata: { type: "my-node", category: "custom" },
  inputPorts: [
    /* ... */
  ],
  outputPorts: [
    /* ... */
  ],
  parameters: {
    /* ... */
  },
});

// Implement the logic
const executable = createNodeExecutable({
  async execute(context, config) {
    // Your logic here
    return {
      success: true,
      outputs: {
        /* ... */
      },
    };
  },
});
```

## Templates

Pre-built workflows are available as templates:

```typescript
import { getTemplate, getAllTemplates } from "@atomiton/nodes/templates";

// Load a template
const dataTransform = getTemplate("data-transform-pipeline");

// Get all templates
const templates = getAllTemplates();
```

## Serialization

Save and load nodes as YAML:

```typescript
import { toYaml, fromYaml } from "@atomiton/nodes/serialization";

// Save to YAML
const yaml = toYaml(nodeDefinition);

// Load from YAML
const node = fromYaml(yamlString);
```

## Architecture

- **Unified Interface** - All nodes share the same structure
- **Environment Separation** - Browser gets definitions, Node.js gets
  executables
- **Factory Pattern** - Functional approach with composition
- **Type Safety** - Full TypeScript support with Zod validation

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## Development

See [docs/development/DEVELOPER_GUIDE.md](./docs/development/DEVELOPER_GUIDE.md)
for creating custom nodes.

## License

MIT
