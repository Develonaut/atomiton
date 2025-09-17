/**
 * @atomiton/nodes/logic - Node.js Execution Entry Point
 *
 * This entry point provides Node.js execution logic for @atomiton/nodes package.
 * Only import from this entry point in Node.js environments.
 *
 * WHAT'S INCLUDED:
 * - Complete node execution logic with async operations
 * - File system operations (fs, fs/promises)
 * - Child process spawning capabilities
 * - HTTP request handling
 * - All Node.js-specific dependencies
 * - The main `nodes` collection for runtime execution
 *
 * WHAT'S EXCLUDED:
 * - This export is NOT safe for browser environments
 * - Will cause build errors if imported in React/browser code
 * - Contains dynamic imports of Node.js built-in modules
 *
 * USAGE:
 * ```typescript
 * // Node.js environments only (Conductor, Electron main process)
 * import { nodes, fileSystemLogic, shellCommandLogic } from '@atomiton/nodes/logic';
 *
 * // Execute a node in Node.js runtime
 * const result = await fileSystemLogic.execute(context);
 *
 * // For browser environments, use the default entry point:
 * // import { fileSystemMetadata, fileSystemParameters } from '@atomiton/nodes';
 * ```
 *
 * ARCHITECTURE NOTE:
 * This separation follows the n8n pattern but with simplified single-package approach.
 * The Conductor package uses this entry point for actual node execution, while
 * browser clients use the default entry point for UI metadata and type information.
 */

// Complete node collection for runtime execution
export { nodes } from "./nodes";

// Individual node execution logic exports
export { codeLogic } from "./nodes/code/logic";
export { csvReaderLogic } from "./nodes/csv-reader/logic";
export { fileSystemLogic } from "./nodes/file-system/logic";
export { httpRequestLogic } from "./nodes/http-request/logic";
export { imageCompositeLogic } from "./nodes/image-composite/logic";
export { loopLogic } from "./nodes/loop/logic";
export { parallelLogic } from "./nodes/parallel/logic";
export { shellCommandLogic } from "./nodes/shell-command/logic";
export { transformLogic } from "./nodes/transform/logic";
