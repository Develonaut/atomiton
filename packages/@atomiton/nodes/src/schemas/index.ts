/**
 * Schemas Module
 * Runtime validation schemas for node parameters
 */

// Core node schemas (system types)
export * from "#schemas/node";

// Registry and registration
export {
  getNodeSchema,
  getAllNodeSchemas,
  hasNodeSchema,
  getNodeSchemaTypes,
  registerAllNodeSchemas,
  type NodeSchemaEntry,
} from "#schemas/registry";

// Individual node parameter schemas
export { default as codeSchemaShape, type CodeParameters } from "#schemas/code";
export {
  default as csvReaderSchemaShape,
  type CSVReaderParameters,
} from "#schemas/csv-reader";
export {
  default as fileSystemSchemaShape,
  type FileSystemParameters,
} from "#schemas/file-system";
export {
  default as groupSchemaShape,
  type GroupParameters,
} from "#schemas/group";
export {
  default as httpRequestSchemaShape,
  type HttpRequestParameters,
} from "#schemas/http-request";
export {
  default as imageCompositeSchemaShape,
  type ImageCompositeParameters,
} from "#schemas/image-composite";
export { default as loopSchemaShape, type LoopParameters } from "#schemas/loop";
export {
  default as parallelSchemaShape,
  type ParallelParameters,
} from "#schemas/parallel";
export {
  default as shellCommandSchemaShape,
  type ShellCommandParameters,
} from "#schemas/shell-command";
export {
  default as transformSchemaShape,
  type TransformParameters,
} from "#schemas/transform";
