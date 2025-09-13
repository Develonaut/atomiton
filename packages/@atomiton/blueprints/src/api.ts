// Note: Direct import from @atomiton/nodes has module resolution issues
// Using fallback approach for validation context
import {
  BLUEPRINT_SCHEMA,
  OPTIONAL_BLUEPRINT_FIELDS,
  REQUIRED_BLUEPRINT_FIELDS,
  SCHEMA_VERSION,
} from "./schema.js";
import {
  extractBlueprintMetadata,
  fromYaml,
  isValidBlueprintYaml,
  migrateBlueprintVersion,
  normalizeBlueprint,
  safeFromYaml,
  safeToYaml,
  toYaml,
  validateRoundTrip,
} from "./transform.js";
import type {
  BlueprintAPIError,
  BlueprintAPIResult,
  BlueprintDefinition,
  BlueprintSchema,
  BlueprintValidationContext,
  TransformationOptions,
  TransformationResult,
  ValidationResult,
} from "./types.js";
import {
  isBlueprintDefinition,
  validateBlueprint,
  validateBlueprintSemantics,
} from "./validation.js";

/**
 * BlueprintsAPI - Main interface for interacting with the Blueprints package
 *
 * Provides a comprehensive singleton API for blueprint validation, transformation,
 * and management following the established pattern from @atomiton/yaml.
 */
export class BlueprintsAPI {
  private static instance: BlueprintsAPI;

  private constructor() {
    // Private constructor to prevent direct instantiation
    if (BlueprintsAPI.instance) {
      throw new Error(
        "BlueprintsAPI is a singleton. Use BlueprintsAPI.getInstance() instead.",
      );
    }
  }

  /**
   * Get the singleton instance of BlueprintsAPI
   */
  static getInstance(): BlueprintsAPI {
    if (!BlueprintsAPI.instance) {
      BlueprintsAPI.instance = new BlueprintsAPI();
    }
    return BlueprintsAPI.instance;
  }

  // ========== Conversion Methods ==========

  /**
   * Convert YAML string to Blueprint JSON
   * Used when loading from storage for editing or execution
   */
  fromYaml(
    yamlString: string,
    options?: TransformationOptions,
  ): BlueprintDefinition {
    const result = fromYaml(
      yamlString,
      options,
      this.createValidationContext(),
    );

    if (!result.success || !result.data) {
      const errorMsg =
        result.errors?.[0]?.message || "Failed to convert YAML to blueprint";
      throw new Error(`Blueprint fromYaml failed: ${errorMsg}`);
    }

    return result.data;
  }

  /**
   * Safely convert YAML string to Blueprint JSON with error handling
   */
  safeFromYaml(
    yamlString: string,
    options?: TransformationOptions,
  ): BlueprintAPIResult<BlueprintDefinition> {
    const result = safeFromYaml(
      yamlString,
      options,
      this.createValidationContext(),
    );

    return {
      success: result.success,
      data: result.data,
      error: result.errors?.[0]
        ? this.convertToAPIError(result.errors[0])
        : undefined,
      warnings: result.warnings?.map((warning) =>
        this.convertToAPIError(warning),
      ),
    };
  }

  /**
   * Convert Blueprint JSON to YAML string
   * Used when saving edited content back to storage
   */
  toYaml(
    blueprint: BlueprintDefinition,
    options?: TransformationOptions,
  ): string {
    const result = toYaml(blueprint, options, this.createValidationContext());

    if (!result.success || !result.data) {
      const errorMsg =
        result.errors?.[0]?.message || "Failed to convert blueprint to YAML";
      throw new Error(`Blueprint toYaml failed: ${errorMsg}`);
    }

    return result.data;
  }

  /**
   * Safely convert Blueprint JSON to YAML string with error handling
   */
  safeToYaml(
    blueprint: BlueprintDefinition,
    options?: TransformationOptions,
  ): BlueprintAPIResult<string> {
    const result = safeToYaml(
      blueprint,
      options,
      this.createValidationContext(),
    );

    return {
      success: result.success,
      data: result.data,
      error: result.errors?.[0]
        ? this.convertToAPIError(result.errors[0])
        : undefined,
      warnings: result.warnings?.map((warning) =>
        this.convertToAPIError(warning),
      ),
    };
  }

  // ========== Validation Methods ==========

  /**
   * Validate blueprint structure and semantics
   */
  validate(
    blueprint: unknown,
    context?: BlueprintValidationContext,
  ): ValidationResult {
    const validationContext = context || this.createValidationContext();
    return validateBlueprint(blueprint, validationContext);
  }

  /**
   * Type guard function to check if data is a valid BlueprintDefinition
   */
  isValid(blueprint: unknown): blueprint is BlueprintDefinition {
    return isBlueprintDefinition(blueprint);
  }

  /**
   * Validate only the semantic aspects of a blueprint
   */
  validateSemantics(
    blueprint: BlueprintDefinition,
    context?: BlueprintValidationContext,
  ): ValidationResult {
    const validationContext = context || this.createValidationContext();
    return validateBlueprintSemantics(blueprint, validationContext);
  }

  /**
   * Check if YAML string represents a valid blueprint
   */
  isValidYaml(yamlString: string): boolean {
    return isValidBlueprintYaml(yamlString, this.createValidationContext());
  }

  // ========== Schema Methods ==========

  /**
   * Get the blueprint schema definition
   */
  getSchema(): BlueprintSchema {
    return {
      version: SCHEMA_VERSION,
      type: "blueprint",
      properties: BLUEPRINT_SCHEMA._def.shape as unknown as Record<
        string,
        unknown
      >,
      required: [...REQUIRED_BLUEPRINT_FIELDS],
    };
  }

  /**
   * Get the current schema version
   */
  getSchemaVersion(): string {
    return SCHEMA_VERSION;
  }

  /**
   * Get required fields for a valid blueprint
   */
  getRequiredFields(): readonly string[] {
    return REQUIRED_BLUEPRINT_FIELDS;
  }

  /**
   * Get optional fields for blueprints
   */
  getOptionalFields(): readonly string[] {
    return OPTIONAL_BLUEPRINT_FIELDS;
  }

  // ========== Utility Methods ==========

  /**
   * Test round-trip conversion to ensure data integrity
   */
  validateRoundTrip(
    yamlString: string,
    options?: TransformationOptions,
  ): TransformationResult<{
    original: string;
    converted: string;
    isEqual: boolean;
  }> {
    return validateRoundTrip(
      yamlString,
      options,
      this.createValidationContext(),
    );
  }

  /**
   * Normalize a blueprint by converting through YAML
   */
  normalize(
    blueprint: BlueprintDefinition,
    options?: TransformationOptions,
  ): BlueprintDefinition {
    const result = normalizeBlueprint(blueprint, options);

    if (!result.success || !result.data) {
      const errorMsg =
        result.errors?.[0]?.message || "Failed to normalize blueprint";
      throw new Error(`Blueprint normalization failed: ${errorMsg}`);
    }

    return result.data;
  }

  /**
   * Extract basic metadata from YAML without full parsing
   */
  extractMetadata(yamlString: string): {
    id?: string;
    name?: string;
    version?: string;
    created?: string;
    modified?: string;
  } | null {
    return extractBlueprintMetadata(yamlString);
  }

  /**
   * Migrate blueprint to current schema version
   */
  migrate(blueprint: unknown, targetVersion?: string): BlueprintDefinition {
    const result = migrateBlueprintVersion(blueprint, targetVersion);

    if (!result.success || !result.data) {
      const errorMsg =
        result.errors?.[0]?.message || "Failed to migrate blueprint";
      throw new Error(`Blueprint migration failed: ${errorMsg}`);
    }

    return result.data;
  }

  /**
   * Create a new blueprint with required fields
   */
  create(params: {
    id: string;
    name: string;
    category: string;
    type: string;
    description?: string;
    author?: string;
    tags?: string[];
  }): BlueprintDefinition {
    const now = new Date().toISOString();

    const blueprint: BlueprintDefinition = {
      id: params.id,
      name: params.name,
      description: params.description,
      category: params.category,
      type: params.type,
      version: "1.0.0",
      metadata: {
        created: now,
        modified: now,
        author: params.author,
        tags: params.tags,
      },
      nodes: [],
      edges: [],
    };

    // Validate the created blueprint
    const validation = this.validate(blueprint);
    if (!validation.success) {
      throw new Error(
        `Created blueprint is invalid: ${validation.errors[0]?.message}`,
      );
    }

    return blueprint;
  }

  // ========== Internal Methods ==========

  /**
   * Create a validation context with available node types
   */
  private createValidationContext(): BlueprintValidationContext {
    // Use fallback to common node types - @atomiton/nodes integration
    // has module resolution issues in the current build setup
    const commonNodeTypes = [
      "csv-reader",
      "file-system",
      "http-request",
      "shell-command",
      "image-composite",
      "transform",
      "code",
      "loop",
      "parallel",
    ];

    return {
      availableNodeTypes: commonNodeTypes,
      strictMode: false,
    };
  }

  /**
   * Convert validation error to API error format
   */
  private convertToAPIError(error: {
    path: string;
    message: string;
    code: string;
    data?: unknown;
  }): BlueprintAPIError {
    return {
      message: error.message,
      code: error.code,
      details: {
        path: error.path,
        data: error.data,
      },
    };
  }

  /**
   * Get version information
   */
  getVersion(): string {
    return "0.1.0";
  }

  // ========== Advanced Methods ==========

  /**
   * Clone a blueprint with new ID and updated timestamps
   */
  clone(
    blueprint: BlueprintDefinition,
    newId: string,
    options?: {
      name?: string;
      author?: string;
      preserveNodeIds?: boolean;
    },
  ): BlueprintDefinition {
    const now = new Date().toISOString();

    const cloned: BlueprintDefinition = {
      ...blueprint,
      id: newId,
      name: options?.name || `${blueprint.name} (Copy)`,
      metadata: {
        ...blueprint.metadata,
        created: now,
        modified: now,
        author: options?.author || blueprint.metadata.author,
      },
    };

    // Generate new node IDs if requested
    if (!options?.preserveNodeIds) {
      const nodeIdMap = new Map<string, string>();

      cloned.nodes = blueprint.nodes.map((node) => {
        const newNodeId = `${newId}_node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        nodeIdMap.set(node.id, newNodeId);

        return {
          ...node,
          id: newNodeId,
        };
      });

      // Update edge references to use new node IDs
      cloned.edges = blueprint.edges.map((edge) => ({
        ...edge,
        id: `${newId}_edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: nodeIdMap.get(edge.source) || edge.source,
        target: nodeIdMap.get(edge.target) || edge.target,
      }));
    }

    return cloned;
  }

  /**
   * Merge multiple blueprints into one
   */
  merge(
    blueprints: BlueprintDefinition[],
    targetId: string,
    targetName: string,
  ): BlueprintDefinition {
    if (blueprints.length === 0) {
      throw new Error("Cannot merge empty blueprint array");
    }

    const now = new Date().toISOString();
    const allNodes: BlueprintDefinition["nodes"] = [];
    const allEdges: BlueprintDefinition["edges"] = [];
    const nodeIdMap = new Map<string, string>();

    // Merge all nodes with unique IDs
    blueprints.forEach((blueprint, bpIndex) => {
      blueprint.nodes.forEach((node, nodeIndex) => {
        const newNodeId = `${targetId}_bp${bpIndex}_node${nodeIndex}_${node.id}`;
        nodeIdMap.set(node.id, newNodeId);

        allNodes.push({
          ...node,
          id: newNodeId,
          // Offset positions to prevent overlap
          position: {
            x: node.position.x + bpIndex * 300,
            y: node.position.y,
          },
        });
      });
    });

    // Merge all edges with updated node references
    blueprints.forEach((blueprint, bpIndex) => {
      blueprint.edges.forEach((edge, edgeIndex) => {
        const newEdgeId = `${targetId}_bp${bpIndex}_edge${edgeIndex}_${edge.id}`;

        allEdges.push({
          ...edge,
          id: newEdgeId,
          source: nodeIdMap.get(edge.source) || edge.source,
          target: nodeIdMap.get(edge.target) || edge.target,
        });
      });
    });

    const mergedBlueprint: BlueprintDefinition = {
      id: targetId,
      name: targetName,
      description: `Merged blueprint from ${blueprints.length} source blueprints`,
      category: blueprints[0].category,
      type: blueprints[0].type,
      version: "1.0.0",
      metadata: {
        created: now,
        modified: now,
        tags: ["merged"],
      },
      nodes: allNodes,
      edges: allEdges,
    };

    // Validate the merged blueprint
    const validation = this.validate(mergedBlueprint);
    if (!validation.success) {
      throw new Error(
        `Merged blueprint is invalid: ${validation.errors[0]?.message}`,
      );
    }

    return mergedBlueprint;
  }
}

// Export singleton instance
export const blueprints = BlueprintsAPI.getInstance();
