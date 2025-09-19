// Main exports - clean and simple API
export { Events, events } from "./events";
export type { EventManager, EventHandler } from "./events";

// Export the centralized event registry
export type {
  EventRegistry,
  UIEvents,
  ConductorEvents,
  StorageEvents,
  SystemEvents,
  EditorEvents,
  IPCEvents,
  EventName,
  EventData,
  EventsOfDomain,
} from "./registry";
