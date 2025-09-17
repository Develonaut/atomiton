/**
 * @atomiton/nodes - Browser-Safe Entry Point
 *
 * This is the default entry point for @atomiton/nodes package, designed for browser environments.
 *
 * WHAT'S INCLUDED:
 * - Node metadata, parameters, and port definitions
 * - Type definitions and interfaces
 * - Utility functions for node discovery and categorization
 * - Composite node creation and template management
 * - All browser-safe functionality
 *
 * WHAT'S EXCLUDED:
 * - Node execution logic (requires Node.js runtime)
 * - File system operations (fs, path modules)
 * - Child process spawning
 * - Any Node.js-specific dependencies
 *
 * USAGE:
 * ```typescript
 * // Browser/React components - use default import
 * import { getNodesByCategory, createCompositeNode } from '@atomiton/nodes';
 *
 * // For Node.js execution logic, use the /logic entry point instead:
 * // import { nodes, fileSystemLogic } from '@atomiton/nodes/logic';
 * ```
 *
 * This separation ensures browser bundles never include Node.js dependencies,
 * preventing "Module externalized for browser compatibility" warnings.
 */

// Core type definitions and interfaces
export * from "./base";
export * from "./types";

// Explicit type exports for monorepo compatibility
export type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodeDefinition,
  NodePortDefinition,
} from "./types";
export type {
  INode,
  IAtomicNode,
  ICompositeNode,
  CompositeEdge,
} from "./base/INode";

// Composite node functionality (browser-safe)
export { createCompositeNode } from "./composite";
export type {
  CompositeDefinition,
  CompositeNodeSpec,
  CompositePosition,
  CompositeVariable,
  CompositeSettings,
} from "./composite/types";
export {
  getAllCompositeTemplates,
  getTemplatesByDifficulty,
  getTemplatesByTag,
  type CompositeTemplate,
} from "./composite/templates";

// Node discovery and categorization utilities
export { getNodesByCategory, getNodes, getNodeByType } from "./nodes/utils";

export { codeMetadata } from "./nodes/code/metadata";
export { codeParameters } from "./nodes/code/parameters";
export { codePorts } from "./nodes/code/ports";

export { csvReaderMetadata } from "./nodes/csv-reader/metadata";
export { csvReaderParameters } from "./nodes/csv-reader/parameters";
export { csvReaderPorts } from "./nodes/csv-reader/ports";

export { fileSystemMetadata } from "./nodes/file-system/metadata";
export { fileSystemParameters } from "./nodes/file-system/parameters";
export { fileSystemPorts } from "./nodes/file-system/ports";

export { httpRequestMetadata } from "./nodes/http-request/metadata";
export { httpRequestParameters } from "./nodes/http-request/parameters";
export { httpRequestPorts } from "./nodes/http-request/ports";

export { imageCompositeMetadata } from "./nodes/image-composite/metadata";
export { imageCompositeParameters } from "./nodes/image-composite/parameters";
export { imageCompositePorts } from "./nodes/image-composite/ports";

export { loopMetadata } from "./nodes/loop/metadata";
export { loopParameters } from "./nodes/loop/parameters";
export { loopPorts } from "./nodes/loop/ports";

export { parallelMetadata } from "./nodes/parallel/metadata";
export { parallelParameters } from "./nodes/parallel/parameters";
export { parallelPorts } from "./nodes/parallel/ports";

export { shellCommandMetadata } from "./nodes/shell-command/metadata";
export { shellCommandParameters } from "./nodes/shell-command/parameters";
export { shellCommandPorts } from "./nodes/shell-command/ports";

export { transformMetadata } from "./nodes/transform/metadata";
export { transformParameters } from "./nodes/transform/parameters";
export { transformPorts } from "./nodes/transform/ports";

export * from "./nodes/types";
