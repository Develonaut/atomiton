// @atomiton/core - Main Package Export
// Public API for the Atomiton Blueprint platform

// ============================================================================
// Re-export from @atomiton/store - Module-based API
// ============================================================================

export {
  // Core functions
  initialize as initializeStore,
  isInitialized as isStoreInitialized,
  cleanup as cleanupStore,

  // Domain methods
  setTheme,
  showNotification,
  dismissNotification,
  selectBlueprint,
  addBlueprint,
  executeBlueprint,
  getStateSnapshot,

  // Store access (advanced use)
  getStores,

  // Subscriptions
  subscribeToUI,
  subscribeToSession,
  subscribeToBlueprint,
  subscribeToExecution,
} from "@atomiton/store";

export type {
  StoreSubscription,
  UIState,
  UIPreferences,
  UITheme,
  ColorScheme,
  LayoutMode,
  Notification,
  Modal,
  PanelState,
  SessionState,
  DragItem,
  Selection,
  Clipboard,
  UndoItem,
  BlueprintState,
  Blueprint,
  ExecutionState,
  Job,
  JobStatus,
  JobProgress,
  JobResult,
} from "@atomiton/store";

// ============================================================================
// Re-export from @atomiton/events - Functional event system
// ============================================================================

export * from "@atomiton/events";

// ============================================================================
// Re-export from @atomiton/nodes
// ============================================================================

export * from "@atomiton/nodes";

// ============================================================================
// Export core systems
// ============================================================================

export * from "./visualization";
export * from "./theme";

export {
  ClientFactory,
  BaseStorageClient,
  FileSystemClient,
  MemoryClient,
  IndexedDBClient,
  MonitoredStorageClient,
  withMonitoring,
  BaseExecutionClient,
  WebWorkerClient,
  NodeProcessClient,
} from "./clients";

export type {
  IStorageClient,
  StorageEvent,
  IExecutionClient,
  ProcessHandle,
  SpawnOptions,
  ProcessResult,
} from "./clients";

export {
  detectPlatform,
  getPlatformInfo,
  type PlatformInfo,
  type PlatformFeatures,
  type Platform as RuntimePlatform,
} from "./platforms";
