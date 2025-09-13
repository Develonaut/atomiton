/**
 * @atomiton/conductor
 *
 * Composite and node execution orchestrator for Atomiton
 * Karen-approved approach: Start simple, build what works
 */

// ✅ WORKING: Simple Composite Execution (Karen approved)
export {
  SimpleExecutor,
  createSimpleNode,
  type SimpleNode,
  type SimpleComposite,
  type SimpleResult,
} from "./simple/SimpleExecutor.js";

// ✅ WORKING: State Management (tested and functional)
export { StateManager } from "./state/StateManager.js";

// 🚧 BROKEN: Complex execution components (excluded from build)
// These are available in source but don't compile yet
// Use SimpleExecutor instead until these are fixed
