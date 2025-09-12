/**
 * @atomiton/conductor
 *
 * Blueprint and node execution orchestrator for Atomiton
 * Karen-approved approach: Start simple, build what works
 */

// ✅ WORKING: Simple Blueprint Execution (Karen approved)
export {
  SimpleExecutor,
  createSimpleNode,
  type SimpleNode,
  type SimpleBlueprint,
  type SimpleResult,
} from "./simple/SimpleExecutor.js";

// ✅ WORKING: State Management (tested and functional)
export { StateManager } from "./state/StateManager.js";

// Re-export storage functionality from @atomiton/storage
export {
  FilesystemStorage,
  BlueprintSerializer,
  SerializationError,
  StorageError,
  type IStorageEngine,
  type IBlueprintSerializer,
  type BlueprintDefinition,
  type StorageItem,
} from "@atomiton/storage";

// 🚧 BROKEN: Complex execution components (excluded from build)
// These are available in source but don't compile yet
// Use SimpleExecutor instead until these are fixed
