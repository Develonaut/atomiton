# Node Developer Guide

## Table of Contents

- [Quick Start: Creating Your First Node](#quick-start-creating-your-first-node)
- [Prerequisites](#prerequisites)
- [Step 1: Set Up the File Structure](#step-1-set-up-the-file-structure)
- [Step 2: Define Configuration Schema](#step-2-define-configuration-schema)
- [Step 3: Implement Business Logic](#step-3-implement-business-logic)
- [Step 4: Create the UI Component](#step-4-create-the-ui-component)
- [Step 5: Register Your Node](#step-5-register-your-node)
- [Step 6: Write Tests](#step-6-write-tests)
- [Advanced Topics](#advanced-topics)
  - [State Management](#state-management)
  - [Error Handling](#error-handling)
  - [Performance Optimization](#performance-optimization)
  - [Custom Visualization](#custom-visualization)
- [Node Types](#node-types)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Quick Start: Creating Your First Node

This guide walks you through creating a new node for the Atomiton system. We'll build a simple "Text Transform" node as an example.

## Prerequisites

- TypeScript knowledge
- Basic React understanding
- Familiarity with async/await patterns

## Step 1: Set Up the File Structure

Create a new directory for your node:

```
packages/nodes/src/nodes/text-transform/
├── index.ts                 # Main export
├── TextTransform.config.ts  # Configuration schema
├── TextTransform.logic.ts   # Business logic
├── TextTransform.ui.tsx     # React component
└── TextTransform.test.ts    # Unit tests
```

## Step 2: Define Configuration Schema

Start with the configuration schema using Zod:

```typescript
// TextTransform.config.ts
import { z } from "zod";

export const textTransformConfigSchema = z.object({
  operation: z
    .enum(["uppercase", "lowercase", "capitalize", "reverse", "trim"])
    .default("uppercase")
    .describe("The transformation to apply"),

  trimWhitespace: z
    .boolean()
    .default(true)
    .describe("Remove leading/trailing whitespace"),

  removeExtraSpaces: z
    .boolean()
    .default(false)
    .describe("Replace multiple spaces with single space"),

  customReplace: z
    .object({
      enabled: z.boolean().default(false),
      search: z.string().default(""),
      replace: z.string().default(""),
      useRegex: z.boolean().default(false),
    })
    .optional(),
});

export type TextTransformConfig = z.infer<typeof textTransformConfigSchema>;

export const defaultConfig: TextTransformConfig = {
  operation: "uppercase",
  trimWhitespace: true,
  removeExtraSpaces: false,
};
```

## Step 3: Implement Business Logic

Create the node logic extending `BaseNodeLogic`:

```typescript
// TextTransform.logic.ts
import { BaseNodeLogic } from "../../base/BaseNodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import {
  textTransformConfigSchema,
  type TextTransformConfig,
} from "./TextTransform.config";

export class TextTransformLogic extends BaseNodeLogic<TextTransformConfig> {
  async execute(
    context: NodeExecutionContext,
    config: TextTransformConfig,
  ): Promise<NodeExecutionResult> {
    try {
      // Validate inputs
      const inputText = this.getInput<string>(context, "text");
      if (!inputText) {
        return this.createErrorResult("Text input is required");
      }

      // Report progress
      this.reportProgress(context, 10, "Starting text transformation");

      // Perform transformation
      let result = String(inputText);

      // Apply whitespace operations first
      if (config.trimWhitespace) {
        result = result.trim();
      }

      if (config.removeExtraSpaces) {
        result = result.replace(/\s+/g, " ");
      }

      // Apply main operation
      switch (config.operation) {
        case "uppercase":
          result = result.toUpperCase();
          break;
        case "lowercase":
          result = result.toLowerCase();
          break;
        case "capitalize":
          result = result.replace(/\b\w/g, (l) => l.toUpperCase());
          break;
        case "reverse":
          result = result.split("").reverse().join("");
          break;
        case "trim":
          result = result.trim();
          break;
      }

      // Apply custom replace if enabled
      if (config.customReplace?.enabled && config.customReplace.search) {
        if (config.customReplace.useRegex) {
          const regex = new RegExp(config.customReplace.search, "g");
          result = result.replace(regex, config.customReplace.replace);
        } else {
          result = result.replaceAll(
            config.customReplace.search,
            config.customReplace.replace,
          );
        }
      }

      // Check for abort
      if (this.shouldAbort(context)) {
        return this.createErrorResult("Operation was aborted");
      }

      // Log success
      this.log(context, "info", "Text transformation completed", {
        inputLength: inputText.length,
        outputLength: result.length,
        operation: config.operation,
      });

      this.reportProgress(context, 100, "Transformation complete");

      // Return success result
      return this.createSuccessResult({
        text: result,
        metadata: {
          inputLength: inputText.length,
          outputLength: result.length,
          operation: config.operation,
        },
      });
    } catch (error) {
      this.log(context, "error", "Text transformation failed", { error });
      return this.createErrorResult(error);
    }
  }

  validateConfig(config: unknown): config is TextTransformConfig {
    return textTransformConfigSchema.safeParse(config).success;
  }

  getDefaultConfig(): Partial<TextTransformConfig> {
    return defaultConfig;
  }
}
```

## Step 4: Create UI Component

Build the React component for the node:

```typescript
// TextTransform.ui.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeUIProps } from '../../base/NodePackage';

interface TextTransformUIData {
  operation: string;
  status?: 'idle' | 'running' | 'success' | 'error';
  progress?: number;
}

export const TextTransformUI: React.FC<NodeUIProps<TextTransformUIData>> = ({
  data,
  selected,
}) => {
  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'uppercase': return 'AA';
      case 'lowercase': return 'aa';
      case 'capitalize': return 'Aa';
      case 'reverse': return '⟲';
      case 'trim': return '✂';
      default: return '📝';
    }
  };

  return (
    <div
      className={`
        node-container text-transform-node
        ${selected ? 'selected' : ''}
        ${data.status || 'idle'}
      `}
      style={{
        minWidth: 200,
        padding: '10px',
        borderRadius: '8px',
        background: data.status === 'error' ? '#ff4444' : '#2a2a2a',
        border: selected ? '2px solid #0084ff' : '1px solid #555',
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="text"
        style={{
          background: '#0084ff',
          width: 12,
          height: 12,
        }}
      />

      {/* Node content */}
      <div className="node-header" style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>
          {getOperationIcon(data.operation || 'uppercase')}
        </span>
        <span style={{ fontWeight: 'bold' }}>Text Transform</span>
      </div>

      <div className="node-body">
        <div style={{ fontSize: '12px', color: '#aaa' }}>
          Operation: {data.operation || 'uppercase'}
        </div>

        {data.status === 'running' && data.progress !== undefined && (
          <div style={{ marginTop: '4px' }}>
            <div
              style={{
                width: '100%',
                height: '4px',
                background: '#444',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${data.progress}%`,
                  height: '100%',
                  background: '#0084ff',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        )}

        {data.status === 'error' && (
          <div style={{ color: '#ff6666', fontSize: '11px', marginTop: '4px' }}>
            Error: Check logs
          </div>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="text"
        style={{
          background: '#00ff88',
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
};

TextTransformUI.displayName = 'TextTransformUI';
```

## Step 5: Create the Node Package

Combine everything into a node package:

```typescript
// index.ts
import type { NodePackage, NodeDefinition } from "../../base/NodePackage";
import { TextTransformLogic } from "./TextTransform.logic";
import { TextTransformUI } from "./TextTransform.ui";
import {
  textTransformConfigSchema,
  type TextTransformConfig,
} from "./TextTransform.config";

const definition: NodeDefinition = {
  id: "text-transform",
  name: "Text Transform",
  description: "Transform text with various operations",
  category: "Text",
  type: "processor",
  version: "1.0.0",

  inputPorts: [
    {
      id: "text",
      name: "Text",
      type: "input",
      dataType: "string",
      required: true,
      description: "The text to transform",
    },
  ],

  outputPorts: [
    {
      id: "text",
      name: "Transformed Text",
      type: "output",
      dataType: "string",
      description: "The transformed text",
    },
    {
      id: "metadata",
      name: "Metadata",
      type: "output",
      dataType: "object",
      description: "Transformation metadata",
    },
  ],

  icon: "text",

  execute: async (context, config) => {
    const logic = new TextTransformLogic();
    return logic.execute(context, config as TextTransformConfig);
  },
};

export const TextTransformNode: NodePackage<TextTransformConfig> = {
  definition,
  logic: new TextTransformLogic(),
  ui: TextTransformUI,
  configSchema: textTransformConfigSchema,

  metadata: {
    version: "1.0.0",
    author: "Atomiton Team",
    description:
      "Transform text with various operations including case changes, reversal, and custom replacements",
    keywords: ["text", "transform", "uppercase", "lowercase", "string"],
    icon: "text",
    documentationUrl: "https://docs.atomiton.com/nodes/text-transform",
    experimental: false,
    deprecated: false,
  },

  tests: {
    testData: {
      validConfigs: [
        { operation: "uppercase", trimWhitespace: true },
        { operation: "lowercase", removeExtraSpaces: true },
      ],
      invalidConfigs: [
        { operation: "invalid" },
        { trimWhitespace: "not-a-boolean" },
      ],
      validInputs: [{ text: "Hello World" }, { text: "  spaces  " }],
      invalidInputs: [{}, { text: null }],
    },
  },
};

export default TextTransformNode;
```

## Step 6: Write Tests

Create comprehensive tests:

```typescript
// TextTransform.test.ts
import { describe, it, expect } from "vitest";
import { TextTransformLogic } from "./TextTransform.logic";
import type { NodeExecutionContext } from "../../types";

describe("TextTransformLogic", () => {
  const createMockContext = (
    inputs: Record<string, unknown>,
  ): NodeExecutionContext => ({
    nodeId: "test-node",
    instanceId: "test-instance",
    inputs,
    startTime: new Date(),
    limits: {
      maxExecutionTimeMs: 30000,
    },
    reportProgress: () => {},
    log: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  });

  const logic = new TextTransformLogic();

  describe("uppercase operation", () => {
    it("should convert text to uppercase", async () => {
      const context = createMockContext({ text: "hello world" });
      const config = { operation: "uppercase" as const, trimWhitespace: false };

      const result = await logic.execute(context, config);

      expect(result.success).toBe(true);
      expect(result.outputs?.text).toBe("HELLO WORLD");
    });
  });

  describe("lowercase operation", () => {
    it("should convert text to lowercase", async () => {
      const context = createMockContext({ text: "HELLO WORLD" });
      const config = { operation: "lowercase" as const, trimWhitespace: false };

      const result = await logic.execute(context, config);

      expect(result.success).toBe(true);
      expect(result.outputs?.text).toBe("hello world");
    });
  });

  describe("capitalize operation", () => {
    it("should capitalize first letter of each word", async () => {
      const context = createMockContext({ text: "hello world" });
      const config = {
        operation: "capitalize" as const,
        trimWhitespace: false,
      };

      const result = await logic.execute(context, config);

      expect(result.success).toBe(true);
      expect(result.outputs?.text).toBe("Hello World");
    });
  });

  describe("error handling", () => {
    it("should return error when input is missing", async () => {
      const context = createMockContext({});
      const config = { operation: "uppercase" as const, trimWhitespace: false };

      const result = await logic.execute(context, config);

      expect(result.success).toBe(false);
      expect(result.error).toContain("required");
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace when enabled", async () => {
      const context = createMockContext({ text: "  hello world  " });
      const config = { operation: "uppercase" as const, trimWhitespace: true };

      const result = await logic.execute(context, config);

      expect(result.success).toBe(true);
      expect(result.outputs?.text).toBe("HELLO WORLD");
    });

    it("should remove extra spaces when enabled", async () => {
      const context = createMockContext({ text: "hello    world" });
      const config = {
        operation: "uppercase" as const,
        trimWhitespace: false,
        removeExtraSpaces: true,
      };

      const result = await logic.execute(context, config);

      expect(result.success).toBe(true);
      expect(result.outputs?.text).toBe("HELLO WORLD");
    });
  });
});
```

## Step 7: Register the Node

Add your node to the registry:

```typescript
// In your app initialization
import { getGlobalRegistry } from "@atomiton/nodes";
import { TextTransformNode } from "@atomiton/nodes/text-transform";

const registry = getGlobalRegistry();
await registry.register(TextTransformNode);
```

## Best Practices

### 1. Configuration Design

- **Use Zod schemas** for runtime validation
- **Provide defaults** for all optional fields
- **Group related options** in nested objects
- **Add descriptions** for documentation

### 2. Error Handling

- **Validate early** - Check inputs at the start
- **Fail gracefully** - Return clear error messages
- **Log appropriately** - Use correct log levels
- **Preserve context** - Include relevant data in errors

### 3. Performance

- **Report progress** for long operations
- **Check abort signals** periodically
- **Stream large data** instead of loading all
- **Clean up resources** in finally blocks

### 4. Testing

- **Test happy paths** - Normal operation
- **Test error cases** - Invalid inputs, failures
- **Test edge cases** - Empty inputs, limits
- **Mock dependencies** - Isolate logic

### 5. Documentation

- **Inline comments** for complex logic
- **JSDoc comments** for public methods
- **Examples** in documentation
- **Changelog** for versions

## Common Patterns

### Async Operations

```typescript
async execute(context, config) {
  // Use withTimeout for external calls
  const result = await this.withTimeout(
    fetch(config.url),
    5000,
    'Request timed out'
  );

  // Use retry for flaky operations
  const data = await this.retry(
    () => processData(result),
    3,  // max retries
    1000  // base delay
  );

  return this.createSuccessResult({ data });
}
```

### Streaming Data

```typescript
class StreamingNode extends BaseNodeLogic {
  async *executeStream(context, config) {
    const inputStream = this.getInput<ReadableStream>(context, "stream");
    const reader = inputStream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const processed = await this.processChunk(value);
        yield {
          chunk: processed,
          progress: this.calculateProgress(),
        };

        if (this.shouldAbort(context)) {
          throw new Error("Aborted");
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
```

### Resource Management

```typescript
async execute(context, config) {
  const tempFile = await this.createTempFile(context);

  try {
    // Use temp file
    await this.processFile(tempFile);
    const result = await this.readResults(tempFile);
    return this.createSuccessResult({ result });
  } finally {
    // Always cleanup
    await this.deleteTempFile(tempFile);
  }
}
```

## Troubleshooting

### Common Issues

1. **Type errors**: Ensure your config type matches the schema
2. **Missing exports**: Check your index.ts exports everything
3. **UI not rendering**: Verify the component is a valid React component
4. **Tests failing**: Mock all external dependencies

### Debugging Tips

1. Use extensive logging during development
2. Test with the Node Test Runner before integration
3. Use the Registry validation to catch issues early
4. Check the browser console for UI errors

## Advanced Topics

### Custom UI Forms

Create rich configuration forms:

```typescript
export const TextTransformConfigForm: React.FC<{
  config: TextTransformConfig;
  onChange: (config: TextTransformConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="config-form">
      <select
        value={config.operation}
        onChange={e => onChange({ ...config, operation: e.target.value })}
      >
        <option value="uppercase">Uppercase</option>
        <option value="lowercase">Lowercase</option>
        {/* ... */}
      </select>
      {/* More form fields */}
    </div>
  );
};
```

### Dynamic Ports

Create nodes with variable ports:

```typescript
definition: {
  // ...
  getDynamicPorts: (config) => {
    const ports = [];
    for (let i = 0; i < config.inputCount; i++) {
      ports.push({
        id: `input_${i}`,
        name: `Input ${i + 1}`,
        type: 'input',
        dataType: 'any',
      });
    }
    return { inputPorts: ports };
  },
}
```

### Performance Optimization

```typescript
class OptimizedNode extends BaseNodeLogic {
  private cache = new Map();

  async execute(context, config) {
    const cacheKey = this.getCacheKey(context.inputs);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.expensiveOperation(context, config);
    this.cache.set(cacheKey, result);

    return result;
  }
}
```

## Conclusion

Creating nodes for Atomiton is straightforward when you follow the patterns. Focus on:

1. Clear separation between logic and UI
2. Strong typing with TypeScript and Zod
3. Comprehensive error handling
4. Good test coverage
5. Clear documentation

Your nodes will be used by many users, so invest in quality and user experience. Happy coding!
