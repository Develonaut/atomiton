/**
 * @atomiton/events - Event system for inter-component communication
 * Pure functional API with typed events
 */

// ============================================================================
// Core Emitter Functions
// ============================================================================

export {
  // Configuration
  configure,
  getConfig,

  // Core functions
  emit,
  subscribe,
  subscribeFiltered,
  once,

  // Utilities
  createEvent,
  broadcast,
  clearAllListeners,
  getListenerCount,
  getActiveChannels,
} from "./emitter";

// ============================================================================
// High-Level API
// ============================================================================

export {
  // State events
  emitStateChange,
  onStateChange,

  // UI events
  emitUIAction,
  onUIAction,

  // Blueprint events
  emitBlueprintExecution,
  onBlueprintExecution,

  // Node events
  emitNodeEvent,
  onNodeEvent,

  // System events
  emitSystemEvent,
  onSystemEvent,

  // Metrics
  emitMetric,
  onMetric,

  // Debug
  debug,
  onDebug,

  // Event bus pattern
  createEventBus,
} from "./api";

// ============================================================================
// Types
// ============================================================================

export type * from "./types";
