/**
 * Store Module - Centralized state management with Zustand
 * Clean, modern state management with proper dependency layering
 */

// Core store client (lowest level)
export { StoreClient, storeClient } from "../clients/StoreClient";
export type {
  StoreConfig,
  ZustandStore,
  StateUpdater,
  PersistedData,
} from "../clients/StoreClient";

// Store service (public API - highest level)
export { StoreService, storeService } from "../services/StoreService";
export type { StoreSubscription } from "../services/StoreService";

// Individual store exports
export { createUIStore, UIStore, UIActions, UISelectors } from "./uiStore";
export type {
  UIState,
  UIPreferences,
  Theme as UITheme,
  ColorScheme,
  LayoutMode,
  Notification,
  Modal,
  PanelState,
} from "./uiStore";

export {
  createSessionStore,
  SessionStore,
  SessionActions,
  SessionSelectors,
} from "./sessionStore";
export type {
  SessionState,
  DragItem,
  Selection,
  Clipboard,
  UndoItem,
} from "./sessionStore";

export {
  createBlueprintStore,
  BlueprintStore,
  BlueprintActions,
  BlueprintSelectors,
} from "./blueprintStore";
export type { BlueprintState, Blueprint } from "./blueprintStore";

export {
  createExecutionStore,
  ExecutionStore,
  ExecutionActions,
  ExecutionSelectors,
} from "./executionStore";
export type {
  ExecutionState,
  Job,
  JobStatus,
  JobProgress,
  JobResult,
} from "./executionStore";
