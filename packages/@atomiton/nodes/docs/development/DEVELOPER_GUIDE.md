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
packages/@atomiton/nodes/src/atomic/text-transform/
├── index.ts                 # Main export
├── TextTransformNodeConfig.ts  # Configuration schema
├── TextTransformNodeLogic.ts   # Business logic
├── TextTransformNode.ts     # Node implementation
└── TextTransformNode.test.ts   # Unit tests
```

## Step 2: Define Configuration Schema with UI Metadata

Start with the configuration schema using Zod and the new NodeConfig class with UI metadata:

```typescript
// TextTransformNodeConfig.ts
import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

export class TextTransformNodeConfig extends NodeConfig {
  static readonly schema = z.object({
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

    maxLength: z
      .number()
      .min(1)
      .max(10000)
      .default(1000)
      .describe("Maximum output length"),

    customReplace: z
      .object({
        enabled: z.boolean().default(false),
        search: z.string().default(""),
        replace: z.string().default(""),
        useRegex: z.boolean().default(false),
      })
      .optional(),
  });

  static readonly defaults = {
    operation: "uppercase",
    trimWhitespace: true,
    removeExtraSpaces: false,
    maxLength: 1000,
  };

  // UI metadata defines how each field appears in the property panel
  static readonly fields = {
    operation: {
      label: "Transform Operation",
      type: "select",
      options: [
        { value: "uppercase", label: "UPPERCASE" },
        { value: "lowercase", label: "lowercase" },
        { value: "capitalize", label: "Capitalize Words" },
        { value: "reverse", label: "Reverse Text" },
        { value: "trim", label: "Trim Whitespace" },
      ],
      description: "Choose the text transformation to apply",
    },

    trimWhitespace: {
      label: "Trim Whitespace",
      type: "boolean",
      description: "Remove leading and trailing whitespace",
    },

    removeExtraSpaces: {
      label: "Remove Extra Spaces",
      type: "boolean",
      description: "Replace multiple consecutive spaces with single space",
    },

    maxLength: {
      label: "Maximum Length",
      type: "number",
      min: 1,
      max: 10000,
      step: 100,
      description: "Maximum allowed output length",
    },
  };

  constructor() {
    super(
      TextTransformNodeConfig.schema,
      TextTransformNodeConfig.defaults,
      TextTransformNodeConfig.fields,
    );
  }
}

export type TextTransformConfig = z.infer<
  typeof TextTransformNodeConfig.schema
>;
```

### UI Metadata System

The new UI metadata system allows you to specify exactly how each configuration field appears in the property panel. This system supports 13 different control types with intelligent fallbacks.

#### Supported Control Types

1. **text** - Basic text input (default for z.string())
2. **number** - Numeric input with validation (default for z.number())
3. **boolean** - Checkbox control (default for z.boolean())
4. **select** - Dropdown with predefined options (default for z.enum())
5. **textarea** - Multi-line text input
6. **file** - File input with validation
7. **password** - Masked text input
8. **email** - Email validation input
9. **url** - URL validation input
10. **date** - Date picker
11. **time** - Time picker
12. **datetime-local** - Date and time picker
13. **color** - Color picker

#### Field Metadata Properties

```typescript
interface FieldMetadata {
  label?: string; // Display label (defaults to field name)
  type?: ControlType; // Control type (inferred from Zod if not specified)
  description?: string; // Help text
  placeholder?: string; // Input placeholder
  disabled?: boolean; // Whether field is disabled

  // For select controls
  options?: Array<{
    value: string | number;
    label: string;
  }>;

  // For number controls
  min?: number;
  max?: number;
  step?: number;

  // For text controls
  maxLength?: number;
  pattern?: string; // Regex pattern

  // For file controls
  accept?: string; // File type filter
  multiple?: boolean; // Allow multiple files
}
```

#### Intelligent Type Inference

The system automatically infers control types from Zod schemas:

```typescript
// These Zod types automatically get the right controls:
z.string()           → text input
z.string().email()   → email input
z.string().url()     → url input
z.number()           → number input
z.boolean()          → checkbox
z.enum(["a", "b"])   → select dropdown
z.date()             → date picker

// You can override with explicit metadata:
someField: {
  type: "textarea"     // Forces multi-line input for string
}
```

## Step 3: Implement Business Logic

Create the node logic extending `BaseNodeLogic`:

```typescript
// TextTransformNodeLogic.ts
import { BaseNodeLogic } from "../../base/BaseNodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import {
  TextTransformNodeConfig,
  type TextTransformConfig,
} from "./TextTransformNodeConfig";

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
    return TextTransformNodeConfig.schema.safeParse(config).success;
  }

  getDefaultConfig(): Partial<TextTransformConfig> {
    return TextTransformNodeConfig.defaults;
  }
}
```

## Step 4: Create the Node Implementation

Create the main Node class that combines everything:

```typescript
// TextTransformNode.ts
import { Node } from "../../base/Node";
import type { IAtomicNode } from "../../base/INode";
import type { NodeDefinition, NodePort } from "../../types";
import { TextTransformNodeLogic } from "./TextTransformNodeLogic";
import {
  TextTransformNodeConfig,
  type TextTransformConfig,
} from "./TextTransformNodeConfig";

export class TextTransformNode extends Node implements IAtomicNode {
  readonly id = "text-transform-001";
  readonly name = "Text Transform";
  readonly type = "text-transform";

  private logic = new TextTransformNodeLogic();
  private config = new TextTransformNodeConfig();

  constructor() {
    super();
  }

  isComposite(): false {
    return false;
  }

  get inputPorts(): NodePort[] {
    return [
      {
        id: "text",
        name: "Text",
        type: "input",
        dataType: "string",
        required: true,
        description: "The text to transform",
      },
    ];
  }

  get outputPorts(): NodePort[] {
    return [
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
    ];
  }

  get definition(): NodeDefinition {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      category: "Data",
      description: "Transform text with various operations",
      version: "1.0.0",
      inputPorts: this.inputPorts,
      outputPorts: this.outputPorts,
      icon: "text",
      keywords: ["text", "transform", "uppercase", "lowercase", "string"],
    };
  }

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Parse configuration using Zod schema
    const configResult = this.config.schema.safeParse(context.config);
    if (!configResult.success) {
      return {
        success: false,
        error: `Invalid configuration: ${configResult.error.message}`,
        outputs: {},
      };
    }

    return this.logic.execute(context, configResult.data);
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate ports
    if (this.inputPorts.length === 0) {
      errors.push("Node must have at least one input port");
    }
    if (this.outputPorts.length === 0) {
      errors.push("Node must have at least one output port");
    }

    return { valid: errors.length === 0, errors };
  }

  dispose(): void {
    // Clean up any resources if needed
  }
}
```

## Step 5: Export the Node

Create the main export:

```typescript
// index.ts
import { TextTransformNode } from "./TextTransformNode";

// Export the node instance
export const textTransformNode = new TextTransformNode();

// Export the class for custom instantiation if needed
export { TextTransformNode };

// Export configuration types for TypeScript users
export type { TextTransformConfig } from "./TextTransformNodeConfig";

// Default export
export default textTransformNode;
```

## Step 6: Write Tests

Create comprehensive tests:

```typescript
// TextTransformNode.test.ts
import { describe, it, expect } from "vitest";
import { TextTransformLogic } from "./TextTransformNodeLogic";
import type { NodeExecutionContext } from "../../types";

describe("TextTransformLogic", () => {
  const createMockContext = (
    inputs: Record<string, unknown>,
  ): NodeExecutionContext => ({
    nodeId: "test-node",
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

Add your node to the atomic nodes index:

```typescript
// In src/atomic/index.ts
import { textTransformNode } from "./text-transform";

export const ATOMIC_NODES = [
  // ... existing nodes
  textTransformNode,
] as const;
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

### Factory Pattern (Alternative)

You can also use the factory pattern for quick node creation:

```typescript
import nodes from "@atomiton/nodes";

const customTransformNode = nodes.extendNode({
  id: "custom-transform-001",
  name: "Custom Transform",
  type: "custom-transform",

  async execute(context) {
    const input = context.inputs.text as string;
    const transformed = input.split("").reverse().join("");

    return {
      success: true,
      outputs: {
        text: transformed,
        length: transformed.length,
      },
    };
  },

  getInputPorts: () => [
    {
      id: "text",
      name: "Input Text",
      type: "input",
      dataType: "string",
      required: true,
    },
  ],

  getOutputPorts: () => [
    {
      id: "text",
      name: "Output Text",
      type: "output",
      dataType: "string",
    },
  ],

  getMetadata: () => ({
    category: "Text",
    description: "Reverse text input",
    version: "1.0.0",
  }),
});
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
