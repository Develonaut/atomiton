/**
 * Centralized Event Registry
 *
 * All events in the Atomiton system are defined here for easy discovery
 * and type safety. IntelliSense will show all available events when you
 * type events.on('') or events.emit('')
 */

// UI Events - Editor and Canvas interactions
export type UIEvents = {
  "ui:node:selected": { nodeId: string; position?: { x: number; y: number } };
  "ui:node:deleted": { nodeId: string };
  "ui:node:added": {
    nodeId: string;
    type: string;
    position: { x: number; y: number };
  };
  "ui:node:moved": { nodeId: string; position: { x: number; y: number } };
  "ui:connection:created": {
    sourceId: string;
    targetId: string;
    sourceHandle?: string;
    targetHandle?: string;
  };
  "ui:connection:deleted": { sourceId: string; targetId: string };
  "ui:canvas:zoom": { level: number };
  "ui:canvas:pan": { x: number; y: number };
  "ui:file:saved": { filename: string; blueprintId: string };
  "ui:file:opened": { filename: string; blueprintId: string };
  "ui:tab:changed": { tabId: string };
  "ui:panel:resized": { panelId: string; size: number };
};

// Conductor Events - Execution and processing
export type ConductorEvents = {
  "conductor:execute": {
    blueprintId: string;
    executionId: string;
    params?: any;
  };
  "conductor:result": { executionId: string; output: any; success: boolean };
  "conductor:error": { executionId: string; error: string; nodeId?: string };
  "conductor:progress": {
    executionId: string;
    nodeId: string;
    percent: number;
  };
  "conductor:node:started": { executionId: string; nodeId: string };
  "conductor:node:completed": {
    executionId: string;
    nodeId: string;
    output?: any;
  };
  "conductor:node:failed": {
    executionId: string;
    nodeId: string;
    error: string;
  };
};

// Storage Events - Data persistence
export type StorageEvents = {
  "storage:blueprint:saved": { blueprintId: string; timestamp: number };
  "storage:blueprint:loaded": { blueprintId: string };
  "storage:blueprint:deleted": { blueprintId: string };
  "storage:settings:updated": { key: string; value: any };
  "storage:sync:started": void;
  "storage:sync:completed": { success: boolean };
};

// System Events - Application lifecycle
export type SystemEvents = {
  "system:ready": void;
  "system:error": { code: string; message: string; stack?: string };
  "system:warning": { message: string };
  "system:shutdown": { reason?: string };
  "system:update:available": { version: string };
  "system:update:downloaded": { version: string };
};

// Editor Events - Blueprint editing
export type EditorEvents = {
  "editor:blueprint:modified": { blueprintId: string; changes: any };
  "editor:undo": { blueprintId: string };
  "editor:redo": { blueprintId: string };
  "editor:cut": { nodeIds: string[] };
  "editor:copy": { nodeIds: string[] };
  "editor:paste": { position: { x: number; y: number } };
  "editor:select:all": void;
  "editor:delete": { nodeIds: string[] };
};

// IPC Events - Cross-process communication (Electron)
export type IPCEvents = {
  "ipc:main:ready": void;
  "ipc:renderer:ready": { windowId: number };
  "ipc:menu:action": { action: string; params?: any };
  "ipc:file:open": { path: string };
  "ipc:file:save": { path: string; content: string };
  "ipc:window:minimize": void;
  "ipc:window:maximize": void;
  "ipc:window:close": void;
};

// Complete Event Registry - All events in one place
export type EventRegistry = UIEvents &
  ConductorEvents &
  StorageEvents &
  SystemEvents &
  EditorEvents &
  IPCEvents;

// Helpers for filtering events by domain
export type EventsOfDomain<Domain extends string> = {
  [K in keyof EventRegistry as K extends `${Domain}:${string}`
    ? K
    : never]: EventRegistry[K];
};

// Type helpers
export type EventName = keyof EventRegistry;
export type EventData<E extends EventName> = EventRegistry[E];
