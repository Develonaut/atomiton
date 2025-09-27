# Node Development Guide - Atomiton Platform

## Overview

This guide covers the complete process of creating, implementing, and testing
custom nodes for the Atomiton Flow platform. Nodes are the fundamental
building blocks that execute specific tasks within a Flow workflow,
following the unified `INode` interface pattern.

## Node Architecture Fundamentals

### Core Node Concepts

**Node Types:**

- **Atomic Nodes**: Leaf nodes that perform specific tasks (CSV reader, HTTP
  request, database operations)
- **Composite Nodes**: Container nodes that orchestrate multiple child nodes
  (sub-workflows, reusable components)

**Node Interface:**

```typescript
interface INode {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  metadata: INodeMetadata;
  parameters: INodeParameters;
  inputPorts: NodePortDefinition[];
  outputPorts: NodePortDefinition[];
  execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;
  validate(): { valid: boolean; errors: string[] };
  isComposite: boolean;
  dispose(): void;
}
```

### Node Mental Model

**"All Things Are Nodes"** Both simple operations (read CSV file) and complex
workflows (entire data processing pipelines) implement the same `INode`
interface. This creates a powerful composition pattern where nodes can be
combined infinitely without complexity.

## Creating Custom Atomic Nodes

### Basic Node Implementation

**Simple CSV Reader Example:**

```typescript
import {
  IAtomicNode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";

export class CsvReaderNode implements IAtomicNode {
  readonly id: string;
  readonly name: string = "CSV Reader";
  readonly type: string = "csv-reader";
  readonly isComposite: boolean = false;

  metadata = {
    description: "Reads data from CSV files",
    category: "Data Input",
    version: "1.0.0",
    icon: "file-csv",
    tags: ["csv", "file", "input", "data"],
  };

  parameters = {
    schema: {
      file: {
        type: "file",
        label: "CSV File",
        description: "Path to the CSV file to read",
        required: true,
        accept: ".csv",
      },
      headers: {
        type: "boolean",
        label: "Has Headers",
        description: "First row contains column headers",
        default: true,
      },
      delimiter: {
        type: "string",
        label: "Delimiter",
        description: "Column separator character",
        default: ",",
        options: [",", ";", "|", "\t"],
      },
    },
    defaults: {
      headers: true,
      delimiter: ",",
    },
  };

  inputPorts = [];

  outputPorts = [
    {
      id: "data",
      name: "Data",
      type: "array",
      description: "Parsed CSV data as array of objects",
    },
  ];

  constructor(id: string) {
    this.id = id;
  }

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { file, headers, delimiter } = context.parameters;

    try {
      // Validate file parameter
      if (!file) {
        throw new Error("File parameter is required");
      }

      // Read and parse CSV file
      const csvData = await this.readCsvFile(file, { headers, delimiter });

      return {
        success: true,
        outputs: {
          data: csvData,
        },
        metadata: {
          rowCount: csvData.length,
          columns: headers ? Object.keys(csvData[0] || {}) : [],
          executionTime: Date.now() - context.startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: "CSV_READ_ERROR",
          details: { file, headers, delimiter },
        },
      };
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required parameters
    if (!this.parameters.schema.file) {
      errors.push("File parameter schema is missing");
    }

    // Validate port definitions
    if (this.outputPorts.length === 0) {
      errors.push("At least one output port is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  dispose(): void {
    // Clean up any resources, file handles, connections, etc.
  }

  private async readCsvFile(
    filePath: string,
    options: { headers: boolean; delimiter: string },
  ): Promise<any[]> {
    // Implementation for reading and parsing CSV
    // This would use a CSV parsing library like csv-parser
    // Return parsed data as array of objects
  }
}
```

### Advanced Node Features

**Node with Multiple Input/Output Ports:**

```typescript
export class DataTransformerNode implements IAtomicNode {
  readonly isComposite = false;

  inputPorts = [
    {
      id: "input",
      name: "Input Data",
      type: "array",
      description: "Data to transform",
    },
    {
      id: "schema",
      name: "Transform Schema",
      type: "object",
      description: "Transformation rules",
      optional: true,
    },
  ];

  outputPorts = [
    {
      id: "output",
      name: "Transformed Data",
      type: "array",
      description: "Transformed data result",
    },
    {
      id: "errors",
      name: "Transformation Errors",
      type: "array",
      description: "Records that failed transformation",
    },
  ];

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const inputData = context.inputs.input;
    const transformSchema =
      context.inputs.schema || context.parameters.defaultSchema;

    const result = {
      transformed: [],
      errors: [],
    };

    for (const record of inputData) {
      try {
        const transformed = this.applyTransformation(record, transformSchema);
        result.transformed.push(transformed);
      } catch (error) {
        result.errors.push({
          record,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      outputs: {
        output: result.transformed,
        errors: result.errors,
      },
    };
  }

  private applyTransformation(record: any, schema: any): any {
    // Implementation of data transformation logic
  }
}
```

## Node Lifecycle and Execution

### Execution Context

**Context Structure:**

```typescript
interface NodeExecutionContext {
  // Node parameters from user configuration
  parameters: Record<string, any>;

  // Input data from connected nodes
  inputs: Record<string, any>;

  // Execution environment and metadata
  executionId: string;
  flowId: string;
  userId?: string;
  startTime: number;

  // Utilities and services
  storage: IStorageEngine;
  logger: ILogger;
  eventBus: IEventBus;

  // Cancellation support
  signal: AbortSignal;
}
```

### Execution Flow

**Node Execution Lifecycle:**

1. **Validation**: Parameters and inputs validated
2. **Preparation**: Resources allocated, connections established
3. **Execution**: Core node logic runs
4. **Output**: Results formatted and returned
5. **Cleanup**: Resources disposed, connections closed

**Error Handling:**

```typescript
async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
  const timer = context.logger.time(`${this.type}-execution`);

  try {
    // Check for cancellation
    if (context.signal.aborted) {
      throw new Error("Execution was cancelled");
    }

    // Validate inputs
    const validation = this.validateInputs(context.inputs);
    if (!validation.valid) {
      throw new Error(`Invalid inputs: ${validation.errors.join(", ")}`);
    }

    // Execute with timeout
    const result = await Promise.race([
      this.executeCore(context),
      this.createTimeoutPromise(context.parameters.timeout || 30000)
    ]);

    timer.end({ status: "success" });
    return result;

  } catch (error) {
    timer.end({ status: "error", error: error.message });

    return {
      success: false,
      error: {
        message: error.message,
        code: this.getErrorCode(error),
        stack: error.stack,
        context: {
          nodeId: this.id,
          nodeType: this.type,
          parameters: context.parameters
        }
      }
    };
  }
}
```

## Port Configuration and Data Flow

### Port Definition Standards

**Port Types:**

```typescript
type PortDataType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "file"
  | "image"
  | "csv"
  | "json"
  | "xml"
  | "database-connection"
  | "api-response"
  | "stream";

interface NodePortDefinition {
  id: string;
  name: string;
  type: PortDataType;
  description: string;
  optional?: boolean;
  default?: any;
  schema?: JSONSchema;
  constraints?: PortConstraints;
}

interface PortConstraints {
  maxSize?: number;
  allowedTypes?: string[];
  validation?: (value: any) => { valid: boolean; message?: string };
}
```

### Dynamic Port Configuration

**Nodes with Variable Ports:**

```typescript
export class DatabaseQueryNode implements IAtomicNode {
  private _inputPorts: NodePortDefinition[] = [
    {
      id: "connection",
      name: "Database Connection",
      type: "database-connection",
      description: "Database connection string or object",
    },
  ];

  get inputPorts(): NodePortDefinition[] {
    return this._inputPorts;
  }

  // Add dynamic parameter ports based on SQL query
  updatePortsForQuery(sqlQuery: string): void {
    const parameters = this.extractQueryParameters(sqlQuery);

    // Remove old parameter ports
    this._inputPorts = this._inputPorts.filter(
      (port) => !port.id.startsWith("param_"),
    );

    // Add new parameter ports
    parameters.forEach((param) => {
      this._inputPorts.push({
        id: `param_${param.name}`,
        name: param.name,
        type: param.type,
        description: `Query parameter: ${param.name}`,
        optional: param.optional,
      });
    });
  }

  private extractQueryParameters(sql: string): ParameterInfo[] {
    // Parse SQL to find parameters like :paramName or $1, $2, etc.
    // Return parameter information for dynamic port creation
  }
}
```

## Type System Integration

### Node Parameter Types

**Parameter Schema Definition:**

```typescript
interface NodeParameterSchema {
  [parameterName: string]: {
    type:
      | "string"
      | "number"
      | "boolean"
      | "object"
      | "array"
      | "file"
      | "select";
    label: string;
    description: string;
    required?: boolean;
    default?: any;
    options?: any[]; // For select type
    validation?: ValidationRule[];
    ui?: UIHints;
  };
}

interface ValidationRule {
  type: "min" | "max" | "pattern" | "custom";
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

interface UIHints {
  placeholder?: string;
  helpText?: string;
  multiline?: boolean;
  syntax?: "sql" | "javascript" | "json" | "yaml";
  fileExtensions?: string[];
}
```

**Type-Safe Parameter Access:**

```typescript
interface CsvReaderParameters {
  file: string;
  headers: boolean;
  delimiter: string;
  encoding?: string;
}

export class TypedCsvReaderNode implements IAtomicNode {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Type-safe parameter access
    const params = context.parameters as CsvReaderParameters;

    if (!params.file) {
      throw new Error("File parameter is required");
    }

    // Implementation with type safety
  }
}
```

### Schema Validation

**Runtime Parameter Validation:**

```typescript
import Ajv from "ajv";

const ajv = new Ajv();

export class ValidatedNode implements IAtomicNode {
  private parameterSchema = {
    type: "object",
    properties: {
      apiUrl: {
        type: "string",
        format: "uri",
        description: "API endpoint URL",
      },
      timeout: {
        type: "number",
        minimum: 1000,
        maximum: 300000,
        default: 30000,
      },
      headers: {
        type: "object",
        additionalProperties: { type: "string" },
      },
    },
    required: ["apiUrl"],
    additionalProperties: false,
  };

  validate(): { valid: boolean; errors: string[] } {
    const validateParams = ajv.compile(this.parameterSchema);
    const valid = validateParams(this.parameters.defaults);

    return {
      valid,
      errors: valid ? [] : validateParams.errors?.map((e) => e.message) || [],
    };
  }
}
```

## Testing Custom Nodes

### Unit Testing Patterns

**Basic Node Test Structure:**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { CsvReaderNode } from "../CsvReaderNode";
import { createMockExecutionContext } from "@atomiton/nodes/testing";

describe("CsvReaderNode", () => {
  let node: CsvReaderNode;
  let mockContext: NodeExecutionContext;

  beforeEach(() => {
    node = new CsvReaderNode("test-csv-reader");
    mockContext = createMockExecutionContext({
      parameters: {
        file: "/test/data.csv",
        headers: true,
        delimiter: ",",
      },
    });
  });

  describe("validation", () => {
    it("should pass validation with valid configuration", () => {
      const result = node.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail validation when required parameters are missing", () => {
      const invalidNode = new CsvReaderNode("invalid");
      invalidNode.parameters.schema = {}; // Remove required parameters

      const result = invalidNode.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("File parameter schema is missing");
    });
  });

  describe("execution", () => {
    it("should successfully read CSV file with headers", async () => {
      // Mock file system
      mockContext.storage.exists = vi.fn().mockResolvedValue(true);
      mockContext.storage.load = vi
        .fn()
        .mockResolvedValue("name,age,city\nJohn,30,NYC\nJane,25,LA");

      const result = await node.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs.data).toEqual([
        { name: "John", age: "30", city: "NYC" },
        { name: "Jane", age: "25", city: "LA" },
      ]);
      expect(result.metadata?.rowCount).toBe(2);
    });

    it("should handle file not found error gracefully", async () => {
      mockContext.storage.exists = vi.fn().mockResolvedValue(false);

      const result = await node.execute(mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CSV_READ_ERROR");
      expect(result.error?.message).toContain("File not found");
    });

    it("should respect cancellation signals", async () => {
      const abortController = new AbortController();
      mockContext.signal = abortController.signal;

      // Abort immediately
      abortController.abort();

      const result = await node.execute(mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("cancelled");
    });
  });
});
```

### Integration Testing

**Cross-Node Integration Tests:**

```typescript
describe("CSV Reader + Data Transformer Integration", () => {
  it("should process CSV through transformation pipeline", async () => {
    // Create and connect nodes
    const csvReader = new CsvReaderNode("csv-reader");
    const transformer = new DataTransformerNode("transformer");

    // Execute CSV reader
    const csvResult = await csvReader.execute(csvReaderContext);
    expect(csvResult.success).toBe(true);

    // Pass output to transformer
    const transformerContext = createMockExecutionContext({
      inputs: {
        input: csvResult.outputs.data,
      },
      parameters: {
        transformSchema: {
          age: { type: "number", convert: true },
          city: { type: "string", uppercase: true },
        },
      },
    });

    const transformResult = await transformer.execute(transformerContext);

    expect(transformResult.success).toBe(true);
    expect(transformResult.outputs.output[0]).toEqual({
      name: "John",
      age: 30, // Converted to number
      city: "NYC", // Uppercase transformation
    });
  });
});
```

### Performance Testing

**Node Performance Benchmarks:**

```typescript
import { bench, describe } from "vitest";

describe("CSV Reader Performance", () => {
  bench(
    "should process 10K rows within 500ms",
    async () => {
      const node = new CsvReaderNode("perf-test");
      const largeContext = createMockExecutionContext({
        parameters: {
          file: "large-dataset-10k.csv",
          headers: true,
        },
      });

      await node.execute(largeContext);
    },
    { time: 500 },
  );

  bench(
    "should handle 100K rows within 5 seconds",
    async () => {
      const node = new CsvReaderNode("perf-test-large");
      const massiveContext = createMockExecutionContext({
        parameters: {
          file: "massive-dataset-100k.csv",
          headers: true,
        },
      });

      await node.execute(massiveContext);
    },
    { time: 5000 },
  );
});
```

## Node Registration and Discovery

### Node Registry

**Registering Custom Nodes:**

```typescript
import { NodeRegistry } from "@atomiton/nodes";
import { CsvReaderNode } from "./nodes/CsvReaderNode";
import { DataTransformerNode } from "./nodes/DataTransformerNode";

// Register nodes with the global registry
NodeRegistry.register("csv-reader", CsvReaderNode);
NodeRegistry.register("data-transformer", DataTransformerNode);

// Register with category for UI organization
NodeRegistry.registerWithCategory("csv-reader", CsvReaderNode, "Data Input");
NodeRegistry.registerWithCategory(
  "data-transformer",
  DataTransformerNode,
  "Data Processing",
);

// Bulk registration
NodeRegistry.registerMany(
  {
    "csv-reader": CsvReaderNode,
    "json-parser": JsonParserNode,
    "xml-parser": XmlParserNode,
  },
  "Data Input",
);
```

### Node Package Structure

**Recommended Package Organization:**

```
my-custom-nodes/
├── src/
│   ├── nodes/
│   │   ├── input/
│   │   │   ├── CsvReaderNode.ts
│   │   │   ├── JsonReaderNode.ts
│   │   │   └── index.ts
│   │   ├── processing/
│   │   │   ├── DataTransformerNode.ts
│   │   │   ├── FilterNode.ts
│   │   │   └── index.ts
│   │   └── output/
│   │       ├── DatabaseWriterNode.ts
│   │       ├── FileWriterNode.ts
│   │       └── index.ts
│   ├── types/
│   │   ├── parameters.ts
│   │   └── results.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── helpers.ts
│   └── index.ts
├── __tests__/
│   ├── nodes/
│   ├── integration/
│   └── performance/
├── docs/
│   ├── README.md
│   └── node-documentation.md
└── package.json
```

### Plugin System Integration

**Node Plugin Manifest:**

```json
{
  "name": "@company/atomiton-custom-nodes",
  "version": "1.0.0",
  "atomiton": {
    "plugin": true,
    "nodes": [
      {
        "type": "csv-reader",
        "class": "CsvReaderNode",
        "category": "Data Input",
        "icon": "file-csv",
        "description": "Read and parse CSV files"
      },
      {
        "type": "data-transformer",
        "class": "DataTransformerNode",
        "category": "Data Processing",
        "icon": "transform",
        "description": "Transform and manipulate data"
      }
    ]
  }
}
```

## Best Practices and Guidelines

### Performance Best Practices

**Efficient Resource Management:**

- Use streaming for large data processing
- Implement proper connection pooling for database nodes
- Cache expensive computations appropriately
- Clean up resources in the `dispose()` method

**Memory Management:**

```typescript
export class StreamProcessingNode implements IAtomicNode {
  private streams: Set<Stream> = new Set();

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const inputStream = this.createInputStream(context.inputs.data);
    this.streams.add(inputStream);

    try {
      // Process data in chunks to avoid memory issues
      const result = await this.processInChunks(inputStream);
      return { success: true, outputs: { result } };
    } finally {
      // Always clean up streams
      this.cleanup();
    }
  }

  dispose(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.streams.forEach((stream) => {
      if (!stream.destroyed) {
        stream.destroy();
      }
    });
    this.streams.clear();
  }
}
```

### Error Handling Standards

**Structured Error Responses:**

```typescript
interface NodeError {
  message: string;
  code: string;
  category: "validation" | "execution" | "timeout" | "resource" | "network";
  retryable: boolean;
  details?: Record<string, any>;
  cause?: Error;
}

// Example error creation
function createNodeError(
  message: string,
  code: string,
  category: NodeError["category"],
  retryable = false,
  details?: Record<string, any>,
): NodeError {
  return {
    message,
    code,
    category,
    retryable,
    details,
    timestamp: new Date().toISOString(),
  };
}
```

### Documentation Standards

**Node Documentation Template:**

````typescript
/**
 * CSV Reader Node
 *
 * Reads and parses CSV files into structured data arrays.
 *
 * @category Data Input
 * @version 1.0.0
 * @author Your Name <your.email@company.com>
 *
 * @example
 * ```typescript
 * const csvReader = new CsvReaderNode('csv-1');
 * const result = await csvReader.execute({
 *   parameters: {
 *     file: 'data.csv',
 *     headers: true,
 *     delimiter: ','
 *   },
 *   inputs: {},
 *   // ... other context properties
 * });
 * ```
 *
 * @param file - Path to the CSV file to read
 * @param headers - Whether the first row contains column headers
 * @param delimiter - Column separator character (default: ',')
 *
 * @returns Parsed CSV data as array of objects
 *
 * @throws CSV_READ_ERROR - When file cannot be read or parsed
 * @throws INVALID_DELIMITER - When delimiter is not supported
 */
export class CsvReaderNode implements IAtomicNode {
  // Implementation
}
````

---

**Last Updated**: 2025-09-17 **Version Compatibility**: @atomiton/nodes v1.0+
**Review Schedule**: Monthly node development review
