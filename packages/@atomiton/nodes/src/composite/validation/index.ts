/**
 * Composite Validation Utilities
 *
 * Provides comprehensive validation for composite definitions including
 * structural validation, semantic validation, and node type checking.
 */

// Core Validation Functions
export { validateComposite } from "./validateComposite";
export { isCompositeDefinition } from "./isCompositeDefinition";
export { validateCompositeSemantics } from "./validateCompositeSemantics";

// Specific Validation Functions
export { validateNodeUniqueness } from "./validateNodeUniqueness";
export { validateEdgeReferences } from "./validateEdgeReferences";
export { validateNodeTypes } from "./validateNodeTypes";
export { validateEdgeUniqueness } from "./validateEdgeUniqueness";
export { validateMetadata } from "./validateMetadata";

// Utility Functions
export { createValidationError } from "./createValidationError";
export { formatValidationErrors } from "./formatValidationErrors";
export { hasCriticalErrors } from "./hasCriticalErrors";
export { filterErrorsByCode } from "./filterErrorsByCode";
export { groupErrorsByPath } from "./groupErrorsByPath";
