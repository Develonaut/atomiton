// Validation utilities for blueprint definitions
import { BLUEPRINT_SCHEMA } from "./schema.js";
import type {
  BlueprintDefinition,
  ValidationError,
  ValidationResult,
  BlueprintValidationContext,
  BlueprintNode,
  BlueprintEdge,
} from "./types.js";

/**
 * Blueprint Validation Utilities
 *
 * Provides comprehensive validation for blueprint definitions including
 * structural validation, semantic validation, and node type checking.
 */

// ==========================
// Core Validation Functions
// ==========================

/**
 * Validate a blueprint definition using Zod schema
 */
export function validateBlueprint(
  data: unknown,
  context?: BlueprintValidationContext,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // First, validate with Zod schema for structure
    const parseResult = BLUEPRINT_SCHEMA.safeParse(data);

    if (!parseResult.success) {
      const zodErrors = parseResult.error.errors.map(
        (err): ValidationError => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
          data: err,
        }),
      );
      errors.push(...zodErrors);
    } else {
      // If schema validation passes, perform semantic validation
      const blueprint = parseResult.data;
      const semanticResult = validateBlueprintSemantics(blueprint, context);
      errors.push(...semanticResult.errors);
      warnings.push(...(semanticResult.warnings || []));
    }
  } catch (error) {
    errors.push({
      path: "root",
      message:
        error instanceof Error ? error.message : "Unknown validation error",
      code: "VALIDATION_ERROR",
      data: error,
    });
  }

  return {
    success: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Type guard function to check if data is a valid BlueprintDefinition
 */
export function isBlueprintDefinition(
  data: unknown,
): data is BlueprintDefinition {
  const result = validateBlueprint(data);
  return result.success;
}

/**
 * Validate blueprint semantics (relationships, references, etc.)
 */
export function validateBlueprintSemantics(
  blueprint: BlueprintDefinition,
  context?: BlueprintValidationContext,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate node uniqueness
  const nodeValidation = validateNodeUniqueness(blueprint.nodes);
  errors.push(...nodeValidation.errors);

  // Validate edge references
  const edgeValidation = validateEdgeReferences(
    blueprint.edges,
    blueprint.nodes,
  );
  errors.push(...edgeValidation.errors);

  // Validate node types if context is provided
  if (context?.availableNodeTypes) {
    const nodeTypeValidation = validateNodeTypes(
      blueprint.nodes,
      context.availableNodeTypes,
    );
    if (context.strictMode) {
      errors.push(...nodeTypeValidation.errors);
    } else {
      warnings.push(...nodeTypeValidation.errors);
    }
  }

  // Validate edge uniqueness
  const edgeUniquenessValidation = validateEdgeUniqueness(blueprint.edges);
  errors.push(...edgeUniquenessValidation.errors);

  // Validate metadata timestamps
  const metadataValidation = validateMetadata(blueprint.metadata);
  errors.push(...metadataValidation.errors);
  warnings.push(...(metadataValidation.warnings || []));

  return {
    success: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// ==========================
// Specific Validation Functions
// ==========================

/**
 * Validate that all node IDs are unique
 */
export function validateNodeUniqueness(
  nodes: BlueprintNode[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  nodes.forEach((node, index) => {
    if (seenIds.has(node.id)) {
      errors.push({
        path: `nodes[${index}].id`,
        message: `Duplicate node ID: ${node.id}`,
        code: "DUPLICATE_NODE_ID",
        data: { nodeId: node.id, index },
      });
    } else {
      seenIds.add(node.id);
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Validate that all edges reference existing nodes
 */
export function validateEdgeReferences(
  edges: BlueprintEdge[],
  nodes: BlueprintNode[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));

  edges.forEach((edge, index) => {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        path: `edges[${index}].source`,
        message: `Source node not found: ${edge.source}`,
        code: "INVALID_SOURCE_NODE",
        data: { edgeId: edge.id, sourceId: edge.source },
      });
    }

    if (!nodeIds.has(edge.target)) {
      errors.push({
        path: `edges[${index}].target`,
        message: `Target node not found: ${edge.target}`,
        code: "INVALID_TARGET_NODE",
        data: { edgeId: edge.id, targetId: edge.target },
      });
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Validate that all node types are available/registered
 */
export function validateNodeTypes(
  nodes: BlueprintNode[],
  availableNodeTypes: string[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const availableTypesSet = new Set(availableNodeTypes);

  nodes.forEach((node, index) => {
    if (!availableTypesSet.has(node.type)) {
      errors.push({
        path: `nodes[${index}].type`,
        message: `Unknown node type: ${node.type}`,
        code: "UNKNOWN_NODE_TYPE",
        data: {
          nodeId: node.id,
          nodeType: node.type,
          availableTypes: availableNodeTypes,
        },
      });
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Validate that all edge IDs are unique
 */
export function validateEdgeUniqueness(
  edges: BlueprintEdge[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  edges.forEach((edge, index) => {
    if (seenIds.has(edge.id)) {
      errors.push({
        path: `edges[${index}].id`,
        message: `Duplicate edge ID: ${edge.id}`,
        code: "DUPLICATE_EDGE_ID",
        data: { edgeId: edge.id, index },
      });
    } else {
      seenIds.add(edge.id);
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Validate metadata fields
 */
export function validateMetadata(
  metadata: BlueprintDefinition["metadata"],
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // Validate timestamp formats
    const created = new Date(metadata.created);
    const modified = new Date(metadata.modified);

    if (isNaN(created.getTime())) {
      errors.push({
        path: "metadata.created",
        message: "Invalid created timestamp format",
        code: "INVALID_TIMESTAMP",
        data: { created: metadata.created },
      });
    }

    if (isNaN(modified.getTime())) {
      errors.push({
        path: "metadata.modified",
        message: "Invalid modified timestamp format",
        code: "INVALID_TIMESTAMP",
        data: { modified: metadata.modified },
      });
    }

    // Check logical consistency
    if (!isNaN(created.getTime()) && !isNaN(modified.getTime())) {
      if (created > modified) {
        warnings.push({
          path: "metadata",
          message: "Created date is after modified date",
          code: "TIMESTAMP_INCONSISTENCY",
          data: { created: metadata.created, modified: metadata.modified },
        });
      }
    }

    // Validate tags if present
    if (metadata.tags) {
      if (!Array.isArray(metadata.tags)) {
        errors.push({
          path: "metadata.tags",
          message: "Tags must be an array of strings",
          code: "INVALID_TAGS_TYPE",
          data: { tags: metadata.tags },
        });
      } else {
        metadata.tags.forEach((tag, index) => {
          if (typeof tag !== "string") {
            errors.push({
              path: `metadata.tags[${index}]`,
              message: "Tag must be a string",
              code: "INVALID_TAG_TYPE",
              data: { tag, index },
            });
          }
        });
      }
    }
  } catch (error) {
    errors.push({
      path: "metadata",
      message:
        error instanceof Error ? error.message : "Metadata validation error",
      code: "METADATA_VALIDATION_ERROR",
      data: error,
    });
  }

  return {
    success: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// ==========================
// Utility Functions
// ==========================

/**
 * Create a validation error
 */
export function createValidationError(
  path: string,
  message: string,
  code: string,
  data?: unknown,
): ValidationError {
  return { path, message, code, data };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map((error) => `${error.path}: ${error.message} (${error.code})`)
    .join("\n");
}

/**
 * Check if validation result has critical errors
 */
export function hasCriticalErrors(result: ValidationResult): boolean {
  const criticalCodes = [
    "DUPLICATE_NODE_ID",
    "DUPLICATE_EDGE_ID",
    "INVALID_SOURCE_NODE",
    "INVALID_TARGET_NODE",
    "INVALID_TIMESTAMP",
  ];

  return result.errors.some((error) => criticalCodes.includes(error.code));
}

/**
 * Filter validation errors by code
 */
export function filterErrorsByCode(
  errors: ValidationError[],
  codes: string[],
): ValidationError[] {
  const codeSet = new Set(codes);
  return errors.filter((error) => codeSet.has(error.code));
}

/**
 * Group validation errors by path
 */
export function groupErrorsByPath(
  errors: ValidationError[],
): Record<string, ValidationError[]> {
  const grouped: Record<string, ValidationError[]> = {};

  errors.forEach((error) => {
    if (!grouped[error.path]) {
      grouped[error.path] = [];
    }
    grouped[error.path].push(error);
  });

  return grouped;
}
