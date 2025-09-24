# @atomiton/nodes Documentation

## Overview

The nodes package implements a unified architecture where **everything is a
node**. There's no distinction between "atomic" and "composite" nodes - some
nodes simply have children (groups), while others don't (leaf nodes). Any node
can connect to any other node via edges.

## Core Concepts

### Mental Model: "Everything is a Node"

Think of nodes like DOM elements:

- All elements share the same interface
- Some elements have children, some don't
- The presence of children determines behavior, not a "type" field
- Unlimited nesting and composition is possible

### Key Principles

1. **Unified Interface** - All nodes implement the same `NodeDefinition`
   structure
2. **Functional Composition** - Factory functions and composition over classes
3. **Environment Separation** - Browser gets definitions, Node.js gets
   executables
4. **Type Safety** - Full TypeScript support with Zod validation

## Quick Start

### Browser (Definitions Only)

```typescript
import {
  getNodeDefinition,
  getAllNodeDefinitions,
} from "@atomiton/nodes/definitions";

// Get a specific node definition
const httpNode = getNodeDefinition("http-request");

// Get all available definitions
const allNodes = getAllNodeDefinitions();
```

### Desktop/Server (Executables)

```typescript
import { getNodeExecutable } from "@atomiton/nodes/executables";
import { getNodeDefinition } from "@atomiton/nodes/definitions";

// Get both definition and executable
const definition = getNodeDefinition("http-request");
const executable = getNodeExecutable("http-request");

// Execute the node
const result = await executable.execute(context);
```

## Available Nodes

- **http-request** - Make HTTP/API requests
- **csv-reader** - Parse CSV files
- **file-system** - File operations (read, write, list)
- **transform** - Data transformation with JavaScript
- **code** - Execute custom JavaScript/TypeScript
- **loop** - Iterate over arrays/collections
- **parallel** - Parallel execution with concurrency control
- **image-processor** - Image manipulation
- **shell-command** - Execute system commands

## Creating Custom Nodes

See the [Developer Guide](./development/DEVELOPER_GUIDE.md) for detailed
instructions on creating your own nodes.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture
documentation.

## Templates

Pre-built workflow templates are available:

- **Hello World** - Basic workflow example
- **Data Transform** - CSV processing pipeline
- **Image Processor** - Batch image processing

Templates are just node definitions with pre-configured children and edges.
