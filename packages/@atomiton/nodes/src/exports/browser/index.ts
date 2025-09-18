/**
 * @atomiton/nodes - Browser-Safe Exports
 *
 * This module provides browser-safe exports for the node system.
 * It includes everything needed for working with nodes in browser environments,
 * excluding Node.js-specific runtime dependencies.
 *
 * WHAT'S INCLUDED:
 * - Node creation and data types
 * - Node metadata, parameters, and port definitions
 * - Utility functions for node discovery and categorization
 * - Template management
 * - Validation and transformation utilities
 *
 * WHAT'S EXCLUDED:
 * - Node execution logic (requires Node.js runtime)
 * - File system operations
 * - Child process spawning
 * - Any Node.js-specific dependencies
 */

// Main public API
export { createNode } from "../../createNode";
export type { CreateNodeInput } from "../../createNode";

// Composite functionality
export { createCompositeNode } from "../../composite/createCompositeNode";
export { validateComposite } from "../../composite/validation/validateComposite";

// Data types (what you store and edit)
export type {
  Node,
  NodeType,
  NodeEdge,
  NodePosition,
  NodeVariable,
  NodeCategory,
  NodeIcon,
  NodeRuntime,
  NodeSource,
  NodePortType,
  NodePortDataType,
  NodeFieldControlType,
  NodePortDefinition,
} from "../../types";

// Composite types
export type { CompositeDefinition } from "../../composite/types";

// Validation utilities
export {
  validateMetadata,
  createValidationError,
  formatValidationErrors,
  hasCriticalErrors,
  type ValidationError,
  type ValidationResult,
  type ValidationSeverity,
} from "../../validation";

// Transformation utilities
export {
  fromYaml,
  toYaml,
  type TransformationOptions,
  type TransformationResult,
} from "../../transform";

// Schema definitions
export {
  NodeSchema,
  NodeMetadataSchema,
  NodePortDefinitionSchema,
  NodeEdgeSchema,
  NodePositionSchema,
  NodeSettingsSchema,
} from "../../schemas/node-schema";

// Node discovery utilities
export {
  getNodesByCategory,
  getNodes,
  getNodeByType,
  getNodeTypes,
} from "../../atomic/nodes/utils";

// Template utilities
export {
  compositeTemplates,
  getAllTemplates,
  getTemplatesByDifficulty,
  getTemplatesByTag,
  type Template,
  type CompositeTemplate,
} from "../../composite/templates";

// Constants
export {
  NODE_CATEGORIES_ORDER,
  NODE_CATEGORY_DISPLAY_NAMES,
} from "../../constants";

// Utility functions (browser-safe subset)
export {
  createSuccessResult,
  createErrorResult,
  getInputValue,
  getAllInputValues,
  validateRequiredInputs,
} from "../../utils";

// Node metadata exports (for node discovery)
export { codeMetadata } from "../../atomic/nodes/code/metadata";
export { csvReaderMetadata } from "../../atomic/nodes/csv-reader/metadata";
export { fileSystemMetadata } from "../../atomic/nodes/file-system/metadata";
export { httpRequestMetadata } from "../../atomic/nodes/http-request/metadata";
export { imageCompositeMetadata } from "../../atomic/nodes/image-composite/metadata";
export { loopMetadata } from "../../atomic/nodes/loop/metadata";
export { parallelMetadata } from "../../atomic/nodes/parallel/metadata";
export { shellCommandMetadata } from "../../atomic/nodes/shell-command/metadata";
export { transformMetadata } from "../../atomic/nodes/transform/metadata";

// Node parameters exports (for configuration)
export { codeParameters } from "../../atomic/nodes/code/parameters";
export { csvReaderParameters } from "../../atomic/nodes/csv-reader/parameters";
export { fileSystemParameters } from "../../atomic/nodes/file-system/parameters";
export { httpRequestParameters } from "../../atomic/nodes/http-request/parameters";
export { imageCompositeParameters } from "../../atomic/nodes/image-composite/parameters";
export { loopParameters } from "../../atomic/nodes/loop/parameters";
export { parallelParameters } from "../../atomic/nodes/parallel/parameters";
export { shellCommandParameters } from "../../atomic/nodes/shell-command/parameters";
export { transformParameters } from "../../atomic/nodes/transform/parameters";

// Node ports exports (for connectivity)
export { codePorts } from "../../atomic/nodes/code/ports";
export { csvReaderPorts } from "../../atomic/nodes/csv-reader/ports";
export { fileSystemPorts } from "../../atomic/nodes/file-system/ports";
export { httpRequestPorts } from "../../atomic/nodes/http-request/ports";
export { imageCompositePorts } from "../../atomic/nodes/image-composite/ports";
export { loopPorts } from "../../atomic/nodes/loop/ports";
export { parallelPorts } from "../../atomic/nodes/parallel/ports";
export { shellCommandPorts } from "../../atomic/nodes/shell-command/ports";
export { transformPorts } from "../../atomic/nodes/transform/ports";

// Version management
export {
  updateNodeVersion,
  getVersionUpdateOptions,
} from "../../updateNodeVersion";
export type {
  UpdateNodeVersionInput,
  UpdateNodeVersionResult,
  VersionUpdateType,
} from "../../updateNodeVersion";
export {
  parseVersion,
  compareVersions,
  isValidVersionUpgrade,
  incrementVersion,
  validateInitialVersion,
  getNextVersionOptions,
} from "../../validation/version";
export type {
  SemanticVersion,
  VersionComparison,
  VersionValidationResult,
} from "../../validation/version";
