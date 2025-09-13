import type {
  CompositeDefinition,
  CompositeValidationContext,
  ValidationError,
  ValidationResult,
} from "../types.js";
import { validateNodeUniqueness } from "./validateNodeUniqueness.js";
import { validateEdgeReferences } from "./validateEdgeReferences.js";
import { validateNodeTypes } from "./validateNodeTypes.js";
import { validateEdgeUniqueness } from "./validateEdgeUniqueness.js";
import { validateMetadata } from "./validateMetadata.js";

/**
 * Validate composite semantics (relationships, references, etc.)
 */
export function validateCompositeSemantics(
  composite: CompositeDefinition,
  context?: CompositeValidationContext,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate node uniqueness
  const nodeValidation = validateNodeUniqueness(composite.nodes);
  errors.push(...nodeValidation.errors);

  // Validate edge references
  const edgeValidation = validateEdgeReferences(
    composite.edges,
    composite.nodes,
  );
  errors.push(...edgeValidation.errors);

  // Validate node types if context is provided
  if (context?.availableNodeTypes) {
    const nodeTypeValidation = validateNodeTypes(
      composite.nodes,
      context.availableNodeTypes,
    );
    if (context.strictMode) {
      errors.push(...nodeTypeValidation.errors);
    } else {
      warnings.push(...nodeTypeValidation.errors);
    }
  }

  // Validate edge uniqueness
  const edgeUniquenessValidation = validateEdgeUniqueness(composite.edges);
  errors.push(...edgeUniquenessValidation.errors);

  // Validate metadata timestamps
  const metadataValidation = validateMetadata(composite.metadata);
  errors.push(...metadataValidation.errors);
  warnings.push(...(metadataValidation.warnings || []));

  return {
    success: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
