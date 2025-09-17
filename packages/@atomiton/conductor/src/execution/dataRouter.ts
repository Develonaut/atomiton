import type { CompositeEdge } from "@atomiton/nodes";

/**
 * Connection between nodes in a Blueprint
 */
type Connection = CompositeEdge;

/**
 * DataRouter manages data flow between nodes in a Blueprint
 * Routes outputs from source nodes to inputs of target nodes
 */
export class DataRouter {
  /**
   * Route inputs for a specific node based on connections
   */
  routeInputs(
    nodeId: string,
    connections: Connection[],
    nodeOutputs: Map<string, Record<string, unknown>>,
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    // Find all connections targeting this node
    const targetConnections = connections.filter(
      (conn) => conn.target === nodeId,
    );

    for (const connection of targetConnections) {
      const sourceNode = connection.source;
      const sourcePort = connection.sourceHandle || "output";
      const targetPort = connection.targetHandle || "input";

      // Get output from source node
      const sourceOutputs = nodeOutputs.get(sourceNode);
      if (sourceOutputs && sourcePort in sourceOutputs) {
        // Map source output to target input
        inputs[targetPort] = sourceOutputs[sourcePort];
      }
    }

    return inputs;
  }

  /**
   * Route outputs from nodes to Blueprint output ports
   */
  routeOutputs(
    connections: Connection[],
    nodeOutputs: Map<string, Record<string, unknown>>,
  ): Record<string, unknown> {
    const outputs: Record<string, unknown> = {};

    // Find all connections targeting the output node
    const outputConnections = connections.filter(
      (conn) => conn.target === "output",
    );

    for (const connection of outputConnections) {
      const sourceNode = connection.source;
      const sourcePort = connection.sourceHandle || "output";
      const targetPort = connection.targetHandle || "output";

      // Get output from source node
      const sourceOutputs = nodeOutputs.get(sourceNode);
      if (sourceOutputs && sourcePort in sourceOutputs) {
        // Map to Blueprint output
        outputs[targetPort] = sourceOutputs[sourcePort];
      }
    }

    return outputs;
  }

  /**
   * Transform data between incompatible types
   */
  transformData(
    value: unknown,
    sourceType: string,
    targetType: string,
  ): unknown {
    // If types match, no transformation needed
    if (sourceType === targetType) {
      return value;
    }

    // Handle common transformations
    switch (`${sourceType}->${targetType}`) {
      case "string->number":
        return Number(value);

      case "number->string":
        return String(value);

      case "any->string":
        return JSON.stringify(value);

      case "string->json":
        try {
          return JSON.parse(value as string);
        } catch {
          return value;
        }

      case "json->string":
        return JSON.stringify(value);

      case "array->string":
        return Array.isArray(value) ? value.join(",") : String(value);

      case "string->array":
        return typeof value === "string" ? value.split(",") : [value];

      case "boolean->number":
        return value ? 1 : 0;

      case "number->boolean":
        return Boolean(value);

      default:
        // No transformation available, pass through
        return value;
    }
  }

  /**
   * Merge multiple inputs into a single value
   */
  mergeInputs(inputs: unknown[]): unknown {
    if (inputs.length === 0) {
      return undefined;
    }

    if (inputs.length === 1) {
      return inputs[0];
    }

    // If all inputs are arrays, concatenate them
    if (inputs.every(Array.isArray)) {
      return inputs.flat();
    }

    // If all inputs are objects, merge them
    if (
      inputs.every(
        (i) => typeof i === "object" && i !== null && !Array.isArray(i),
      )
    ) {
      return Object.assign({}, ...inputs);
    }

    // Otherwise return as array
    return inputs;
  }

  /**
   * Split output to multiple targets
   */
  splitOutput(value: unknown, targetCount: number): unknown[] {
    const outputs: unknown[] = [];

    for (let i = 0; i < targetCount; i++) {
      // Deep clone for objects/arrays to prevent mutation
      if (typeof value === "object" && value !== null) {
        outputs.push(JSON.parse(JSON.stringify(value)));
      } else {
        outputs.push(value);
      }
    }

    return outputs;
  }

  /**
   * Validate data against expected type
   */
  validateDataType(
    value: unknown,
    expectedType: string,
  ): { valid: boolean; error?: string } {
    switch (expectedType) {
      case "string":
        if (typeof value !== "string") {
          return {
            valid: false,
            error: `Expected string, got ${typeof value}`,
          };
        }
        break;

      case "number":
        if (typeof value !== "number") {
          return {
            valid: false,
            error: `Expected number, got ${typeof value}`,
          };
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          return {
            valid: false,
            error: `Expected boolean, got ${typeof value}`,
          };
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          return { valid: false, error: `Expected array, got ${typeof value}` };
        }
        break;

      case "object":
      case "json":
        if (typeof value !== "object" || value === null) {
          return {
            valid: false,
            error: `Expected object, got ${typeof value}`,
          };
        }
        break;

      case "file":
        // File validation would check for file path or buffer
        if (typeof value !== "string" && !Buffer.isBuffer(value)) {
          return { valid: false, error: "Expected file path or buffer" };
        }
        break;

      case "any":
        // Any type accepts all values
        break;

      default:
        // Unknown type, allow through
        break;
    }

    return { valid: true };
  }

  /**
   * Stream data between nodes for large datasets
   */
  async *streamData(
    source: AsyncIterable<unknown> | Iterable<unknown>,
  ): AsyncGenerator<unknown> {
    for await (const chunk of source) {
      // Process and yield each chunk
      yield chunk;
    }
  }
}
