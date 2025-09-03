// @atomiton/core - Main Package Export
// Comprehensive node system for the Atomiton Blueprint platform

// Export visualization adapters system
export * from "./visualization";

// Export theme system
export * from "./theme";

// Export other core systems (excluding StoreClient to avoid duplicate exports)
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
  EventClient,
  eventClient,
} from "./clients";
export type {
  IStorageClient,
  StorageEvent,
  IExecutionClient,
  ProcessHandle,
  SpawnOptions,
  ProcessResult,
  SystemEvent,
} from "./clients";

// Export platforms with renamed types to avoid conflicts
export {
  detectPlatform,
  getPlatformInfo,
  type PlatformInfo,
  type PlatformFeatures,
  type Platform as RuntimePlatform, // Rename to avoid conflict with node Platform type
} from "./platforms";

// Export store system with renamed types to avoid conflicts
export {
  StoreClient,
  storeClient,
  StoreService,
  storeService,
  createUIStore,
  UIStore,
  UIActions,
  UISelectors,
  createSessionStore,
  SessionStore,
  SessionActions,
  SessionSelectors,
  createBlueprintStore,
  BlueprintStore,
  BlueprintActions,
  BlueprintSelectors,
  createExecutionStore,
  ExecutionStore,
  ExecutionActions,
  ExecutionSelectors,
} from "./store";

export type {
  StoreConfig,
  ZustandStore,
  StateUpdater,
  StoreSubscription,
  PersistedData,
  UIState,
  UIPreferences,
  UITheme, // Renamed in store module to avoid conflict with theme module Theme type
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
} from "./store";
