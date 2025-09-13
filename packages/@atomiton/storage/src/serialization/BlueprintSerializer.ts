import * as yaml from "yaml";

/**
 * Core interface for Blueprint serialization/deserialization
 */
export type IBlueprintSerializer = {
  toYAML(blueprint: BlueprintDefinition): string;
  fromYAML(yamlContent: string): BlueprintDefinition;
  toJSON(blueprint: BlueprintDefinition): string;
  fromJSON(jsonContent: string): BlueprintDefinition;
};

/**
 * Blueprint serialization implementation
 * Handles conversion between BlueprintDefinition objects and YAML/JSON formats
 */
export class BlueprintSerializer implements IBlueprintSerializer {
  /**
   * Convert Blueprint object to YAML string for storage
   */
  toYAML(blueprint: BlueprintDefinition): string {
    return yaml.stringify(blueprint, {
      indent: 2,
      lineWidth: -1, // No line wrapping
      defaultStringType: "QUOTE_DOUBLE",
      defaultKeyType: null,
    });
  }

  /**
   * Parse YAML string to Blueprint object
   */
  fromYAML(yamlContent: string): BlueprintDefinition {
    try {
      const parsed = yaml.parse(yamlContent);
      return this.validateBlueprint(parsed);
    } catch (error) {
      throw new SerializationError(
        "Failed to parse Blueprint YAML",
        error instanceof Error ? error : new Error(String(error)),
        { yamlContent: yamlContent.substring(0, 200) + "..." },
      );
    }
  }

  /**
   * Convert Blueprint object to JSON string for IPC
   */
  toJSON(blueprint: BlueprintDefinition): string {
    try {
      return JSON.stringify(blueprint, null, 2);
    } catch (error) {
      throw new SerializationError(
        "Failed to serialize Blueprint to JSON",
        error instanceof Error ? error : new Error(String(error)),
        { blueprintId: blueprint.id },
      );
    }
  }

  /**
   * Parse JSON string to Blueprint object
   */
  fromJSON(jsonContent: string): BlueprintDefinition {
    try {
      const parsed = JSON.parse(jsonContent);
      return this.validateBlueprint(parsed);
    } catch (error) {
      throw new SerializationError(
        "Failed to parse Blueprint JSON",
        error instanceof Error ? error : new Error(String(error)),
        { jsonContent: jsonContent.substring(0, 200) + "..." },
      );
    }
  }

  /**
   * Validate parsed data matches BlueprintDefinition structure
   * TODO: Implement Zod schema validation when @atomiton/nodes is ready
   */
  private validateBlueprint(data: unknown): BlueprintDefinition {
    if (!data || typeof data !== "object") {
      throw new SerializationError("Invalid Blueprint data: must be an object");
    }

    const record = data as Record<string, unknown>;

    if (!record.id || typeof record.id !== "string") {
      throw new SerializationError(
        "Invalid Blueprint data: missing or invalid id",
      );
    }

    if (!record.name || typeof record.name !== "string") {
      throw new SerializationError(
        "Invalid Blueprint data: missing or invalid name",
      );
    }

    if (!record.version || typeof record.version !== "string") {
      throw new SerializationError(
        "Invalid Blueprint data: missing or invalid version",
      );
    }

    // Basic validation - will be enhanced with Zod schema
    return record as BlueprintDefinition;
  }
}

/**
 * Blueprint serialization error with context
 */
export class SerializationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "SerializationError";

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SerializationError);
    }
  }
}

/**
 * Temporary BlueprintDefinition interface
 * TODO: Use BlueprintDefinition from @atomiton/blueprints when available
 */
export type BlueprintDefinition = {
  id: string;
  name: string;
  version: string;
  description?: string;
  interface?: {
    inputs?: Array<{
      id: string;
      name: string;
      dataType: string;
      required: boolean;
    }>;
    outputs?: Array<{
      id: string;
      name: string;
      dataType: string;
    }>;
  };
  nodes: Array<{
    id: string;
    type: string;
    runtime?: {
      language: "typescript";
    };
    position?: { x: number; y: number };
    config?: Record<string, unknown>;
  }>;
  connections: Array<{
    source: { node: string; port: string };
    target: { node: string; port: string };
  }>;
  metadata?: {
    created: string;
    updated: string;
    author?: string;
  };
};
