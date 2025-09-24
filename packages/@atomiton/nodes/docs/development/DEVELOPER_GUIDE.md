# Node Developer Guide

## Overview

This guide walks you through creating nodes for the Atomiton system. Nodes are
reusable units that process data, and they can be combined to create complex
workflows.

## Table of Contents

- [Quick Start](#quick-start)
- [Node Structure](#node-structure)
- [Creating a Node](#creating-a-node)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Quick Start

Let's create a simple "Text Transform" node that converts text to uppercase.

### 1. Create the Schema

Define what parameters your node accepts:

```typescript
// src/schemas/text-transform.ts
import { z } from "zod";

export const textTransformSchema = z.object({
  operation: z
    .enum(["uppercase", "lowercase", "capitalize"])
    .default("uppercase"),
  trimWhitespace: z.boolean().default(true),
});

export type TextTransformConfig = z.infer<typeof textTransformSchema>;
```

### 2. Create the Definition

Define the node's interface and metadata:

```typescript
// src/definitions/text-transform/definition.ts
import {
  createNodeDefinition,
  createNodeMetadata,
  createNodeParameters,
  createNodePort,
} from "#core/factories";
import { textTransformSchema } from "#schemas/text-transform";

export const textTransformDefinition = createNodeDefinition({
  id: "text-transform",
  name: "Text Transform",

  metadata: createNodeMetadata({
    type: "text-transform",
    version: "1.0.0",
    author: "System",
    description: "Transform text with various operations",
    category: "data",
    icon: "text",
  }),

  parameters: createNodeParameters({
    schema: textTransformSchema,
    defaults: {
      operation: "uppercase",
      trimWhitespace: true,
    },
    fields: {
      operation: {
        controlType: "select",
        label: "Operation",
        options: [
          { value: "uppercase", label: "UPPERCASE" },
          { value: "lowercase", label: "lowercase" },
          { value: "capitalize", label: "Capitalize" },
        ],
      },
      trimWhitespace: {
        controlType: "boolean",
        label: "Trim Whitespace",
      },
    },
  }),

  inputPorts: [
    createNodePort({
      id: "text",
      name: "Text",
      type: "input",
      dataType: "string",
      required: true,
    }),
  ],

  outputPorts: [
    createNodePort({
      id: "text",
      name: "Transformed Text",
      type: "output",
      dataType: "string",
    }),
  ],
});
```

### 3. Create the Executable

Implement the business logic:

```typescript
// src/executables/text-transform/executable.ts
import { createNodeExecutable } from "#core/factories";
import { textTransformSchema } from "#schemas/text-transform";
import type { TextTransformConfig } from "#schemas/text-transform";

export const textTransformExecutable =
  createNodeExecutable<TextTransformConfig>({
    schema: textTransformSchema,

    async execute(context, config) {
      let text = context.inputs.text as string;

      if (!text) {
        return {
          success: false,
          error: "Text input is required",
        };
      }

      // Apply whitespace trimming
      if (config.trimWhitespace) {
        text = text.trim();
      }

      // Apply transformation
      let result: string;
      switch (config.operation) {
        case "uppercase":
          result = text.toUpperCase();
          break;
        case "lowercase":
          result = text.toLowerCase();
          break;
        case "capitalize":
          result = text.replace(/\b\w/g, (l) => l.toUpperCase());
          break;
        default:
          result = text;
      }

      return {
        success: true,
        outputs: {
          text: result,
        },
      };
    },
  });
```

### 4. Register the Node

Add your node to the registries:

```typescript
// src/definitions/registry.ts
export const nodeDefinitions = {
  // ... existing nodes
  "text-transform": textTransformDefinition,
};

// src/executables/registry.ts
export const nodeExecutables = {
  // ... existing nodes
  "text-transform": textTransformExecutable,
};
```

## Node Structure

### File Organization

```
text-transform/
├── definition.ts       # Browser-safe definition
├── definition.test.ts  # Definition tests
├── executable.ts       # Runtime implementation
├── executable.test.ts  # Executable tests
└── executable.bench.ts # Performance benchmarks
```

### Node Components

1. **Schema** - Zod schema defining parameters
2. **Definition** - Node interface (ports, metadata, parameters)
3. **Executable** - Business logic implementation
4. **Tests** - Unit tests for both definition and executable

## Creating a Node

### Step 1: Design Your Node

Before coding, answer these questions:

- What does the node do?
- What inputs does it need?
- What outputs does it produce?
- What parameters control its behavior?

### Step 2: Define the Schema

Use Zod to define parameter validation:

```typescript
const schema = z.object({
  // Required fields
  url: z.string().url(),

  // Optional with defaults
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),

  // Nested objects
  headers: z.record(z.string()).optional(),

  // Numbers with constraints
  timeout: z.number().min(0).max(60000).default(30000),
});
```

### Step 3: Create the Definition

The definition describes the node's interface:

```typescript
const definition = createNodeDefinition({
  id: "unique-node-id",
  name: "Human Readable Name",

  metadata: {
    type: "node-type", // Unique identifier
    category: "io", // io, data, logic, etc.
    icon: "file", // Icon name
    description: "What this node does",
  },

  parameters: {
    schema,
    defaults,
    fields, // UI configuration
  },

  inputPorts: [],
  outputPorts: [],
});
```

### Step 4: Implement the Executable

The executable contains the actual business logic:

```typescript
const executable = createNodeExecutable({
  schema,

  async execute(context, config) {
    try {
      // Access inputs
      const input = context.inputs.myInput;

      // Perform operations
      const result = await doSomething(input, config);

      // Return outputs
      return {
        success: true,
        outputs: {
          myOutput: result,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

## Testing

### Unit Tests

Test your node's definition and executable:

```typescript
// definition.test.ts
describe("TextTransform Definition", () => {
  it("should have correct ports", () => {
    expect(textTransformDefinition.inputPorts).toHaveLength(1);
    expect(textTransformDefinition.outputPorts).toHaveLength(1);
  });

  it("should validate parameters", () => {
    const result = textTransformDefinition.parameters.safeParse({
      operation: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

// executable.test.ts
describe("TextTransform Executable", () => {
  it("should transform to uppercase", async () => {
    const context = {
      nodeId: "test",
      inputs: { text: "hello" },
    };

    const result = await textTransformExecutable.execute(context, {
      operation: "uppercase",
      trimWhitespace: false,
    });

    expect(result.success).toBe(true);
    expect(result.outputs?.text).toBe("HELLO");
  });
});
```

### Benchmark Tests

Measure performance:

```typescript
// executable.bench.ts
import { bench, describe } from "vitest";

describe("TextTransform Performance", () => {
  bench("uppercase transformation", () => {
    const context = { inputs: { text: "test".repeat(1000) } };
    await executable.execute(context, { operation: "uppercase" });
  });
});
```

## Best Practices

### 1. Parameter Design

- Provide sensible defaults
- Use descriptive names
- Group related options
- Add validation constraints

### 2. Error Handling

```typescript
async execute(context, config) {
  // Validate inputs early
  if (!context.inputs.required) {
    return {
      success: false,
      error: 'Missing required input',
    };
  }

  try {
    // Main logic
    const result = await process(context.inputs);

    return {
      success: true,
      outputs: { result },
    };
  } catch (error) {
    // Log for debugging
    context.log?.error('Processing failed', error);

    // Return user-friendly error
    return {
      success: false,
      error: `Processing failed: ${error.message}`,
    };
  }
}
```

### 3. Progress Reporting

For long-running operations:

```typescript
context.reportProgress?.(0, "Starting processing");

for (let i = 0; i < items.length; i++) {
  await processItem(items[i]);
  context.reportProgress?.(
    ((i + 1) / items.length) * 100,
    `Processed ${i + 1} of ${items.length}`,
  );
}

context.reportProgress?.(100, "Complete");
```

### 4. Resource Cleanup

Always clean up resources:

```typescript
let resource;
try {
  resource = await acquireResource();
  const result = await useResource(resource);
  return { success: true, outputs: { result } };
} finally {
  if (resource) {
    await resource.dispose();
  }
}
```

## Common Patterns

### Streaming Data

For processing large datasets:

```typescript
async execute(context, config) {
  const stream = context.inputs.stream;
  const results = [];

  for await (const chunk of stream) {
    const processed = processChunk(chunk);
    results.push(processed);

    // Check for cancellation
    if (context.signal?.aborted) {
      throw new Error('Operation cancelled');
    }
  }

  return {
    success: true,
    outputs: { results },
  };
}
```

### Async Operations with Timeout

```typescript
async execute(context, config) {
  const timeoutMs = config.timeout || 30000;

  const result = await Promise.race([
    performOperation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);

  return {
    success: true,
    outputs: { result },
  };
}
```

### Working with Files

```typescript
import { readFile, writeFile } from 'fs/promises';

async execute(context, config) {
  const { filePath } = config;

  // Read file
  const content = await readFile(filePath, 'utf-8');

  // Process
  const processed = transform(content);

  // Write result
  const outputPath = filePath.replace('.txt', '.processed.txt');
  await writeFile(outputPath, processed);

  return {
    success: true,
    outputs: {
      path: outputPath,
      size: processed.length,
    },
  };
}
```

### HTTP Requests

```typescript
async execute(context, config) {
  const response = await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: config.body ? JSON.stringify(config.body) : undefined,
    signal: context.signal, // Pass abort signal
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    outputs: {
      data,
      status: response.status,
      headers: Object.fromEntries(response.headers),
    },
  };
}
```

## Troubleshooting

### Common Issues

1. **Type Errors** - Ensure schema matches config type
2. **Missing Exports** - Add node to registry
3. **Validation Failures** - Check schema constraints
4. **Runtime Errors** - Add proper error handling

### Debugging Tips

1. Use extensive logging during development
2. Write tests before implementing
3. Use TypeScript strict mode
4. Test with various input combinations
5. Benchmark performance-critical code

## Next Steps

- Explore existing nodes for examples
- Read the [Architecture](./ARCHITECTURE.md) documentation
- Join the community for support
- Share your nodes with others!
