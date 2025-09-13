/**
 * @atomiton/blueprints - Blueprint Package
 *
 * Manages blueprint definitions, validation, and transformations between
 * storage (YAML) and runtime (JSON) formats for the Atomiton platform.
 *
 * @version 0.1.0
 */

// ========== Main API Export ==========
export { blueprints, BlueprintsAPI } from "./api.js";

// ========== Type Exports ==========
export type {
  // Core Blueprint Types
  BlueprintDefinition,
  BlueprintNode,
  BlueprintEdge,
  BlueprintPosition,
  BlueprintNodeData,
  BlueprintEdgeData,
  BlueprintMetadata,
  BlueprintVariable,
  BlueprintVariables,
  BlueprintSettings,

  // Validation Types
  ValidationError,
  ValidationResult,
  BlueprintValidationContext,

  // Schema Types
  BlueprintSchema,

  // Transformation Types
  TransformationOptions,
  TransformationResult,
  BlueprintStorageFormat,
  BlueprintRuntimeFormat,

  // API Types
  BlueprintAPIError,
  BlueprintAPIResult,

  // Utility Types
  DeepPartial,
  RequiredFields,
  OptionalFields,
} from "./types.js";

// ========== Schema Exports ==========
export {
  // Main Schema
  BLUEPRINT_SCHEMA,
  BlueprintDefinitionSchema,

  // Component Schemas
  BlueprintNodeSchema,
  BlueprintEdgeSchema,
  BlueprintMetadataSchema,
  BlueprintVariableSchema,
  BlueprintVariablesSchema,
  BlueprintSettingsSchema,
  BlueprintPositionSchema,

  // Validation Schemas
  ValidationErrorSchema,
  ValidationResultSchema,
  BlueprintValidationContextSchema,

  // Configuration Schemas
  BlueprintSchemaDefinition,
  TransformationOptionsSchema,
  TransformationResultSchema,

  // API Schemas
  BlueprintAPIErrorSchema,
  BlueprintAPIResultSchema,

  // Schema Constants
  SCHEMA_VERSION,
  REQUIRED_BLUEPRINT_FIELDS,
  OPTIONAL_BLUEPRINT_FIELDS,

  // Inferred Types
  type InferredBlueprintDefinition,
  type InferredBlueprintNode,
  type InferredBlueprintEdge,
  type InferredBlueprintMetadata,
  type InferredValidationResult,
  type InferredValidationError,
} from "./schema.js";

// ========== Validation Exports ==========
export {
  // Core Validation Functions
  validateBlueprint,
  isBlueprintDefinition,
  validateBlueprintSemantics,

  // Specific Validation Functions
  validateNodeUniqueness,
  validateEdgeReferences,
  validateNodeTypes,
  validateEdgeUniqueness,
  validateMetadata,

  // Utility Functions
  createValidationError,
  formatValidationErrors,
  hasCriticalErrors,
  filterErrorsByCode,
  groupErrorsByPath,
} from "./validation.js";

// ========== Transformation Exports ==========
export {
  // Core Transformation Functions
  fromYaml,
  toYaml,
  safeFromYaml,
  safeToYaml,

  // Utility Functions
  validateRoundTrip,
  normalizeBlueprint,
  isValidBlueprintYaml,
  extractBlueprintMetadata,
  migrateBlueprintVersion,
} from "./transform.js";

// ========== Package Info ==========
/**
 * Package version
 */
export const VERSION = "0.1.0";

/**
 * Package name
 */
export const PACKAGE_NAME = "@atomiton/blueprints";

/**
 * Supported file extensions for blueprints
 */
export const BLUEPRINT_FILE_EXTENSIONS = [".yaml", ".yml"] as const;

/**
 * Default blueprint category
 */
export const DEFAULT_BLUEPRINT_CATEGORY = "user-blueprints";

/**
 * Default blueprint type
 */
export const DEFAULT_BLUEPRINT_TYPE = "blueprint";
