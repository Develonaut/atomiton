/**
 * Node Definitions Export
 * Browser-safe node definitions and registry
 */

// Export factory functions for creating node definitions
export { default as createNodeDefinition } from "#core/factories/createNodeDefinition";

// Export core types
export type {
  NodeDefinition,
  NodeEdge,
  NodeFieldConfig,
  NodeFieldControlType,
  NodeFieldsConfig,
  NodeMetadata,
  NodeParameters,
  NodePort,
  NodePosition,
} from "#core/types/definition";
export type { Node } from "#core/types/node";

// Export the registry and essential registry functions
export {
  getAllNodeDefinitions,
  getNodeDefinition,
  getNodeDefinitionsGroupedByCategory,
  nodeDefinitionRegistry,
} from "#definitions/registry";

// Export parameter types from schemas module
export type { CSVReaderParameters } from "#schemas/csv-reader";
export type { FileSystemParameters } from "#schemas/file-system";
export type { GroupParameters } from "#schemas/group";
export type { HttpRequestParameters } from "#schemas/http-request";
export type { ImageCompositeParameters } from "#schemas/image-composite";
export type { LoopParameters } from "#schemas/loop";
export type { ParallelParameters } from "#schemas/parallel";
export type { ShellCommandParameters } from "#schemas/shell-command";
export type { TransformParameters } from "#schemas/transform";

// Export template functions (used by client app)
export {
  getAllTemplates,
  getTemplate,
  loadBuiltInTemplates,
} from "#templates/registry";
