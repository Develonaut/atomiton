// Component Exports
export { default as Canvas, Element } from "./components/Canvas";
export { default as Editor } from "./components/Editor";

// Primitives
export * from "./primitives";

// Type Exports - Canvas
export type {
  CanvasConnectionsProps,
  CanvasControlActionProps,
  CanvasControlsProps,
  CanvasElementsProps,
  CanvasGridProps,
  CanvasMinimapProps,
  CanvasProps,
  CanvasSelectionProps,
  CanvasViewportProps,
} from "./components/Canvas";

// Type Exports - Canvas Element
export type { ElementData } from "./components/Element";

// Core Types
export type { EditorState } from "./store";
export type { EditorConfig } from "./types";

// Store
export { editorStore, editorStore as store, onDragStart } from "./store";

// Hooks
export { useStore } from "./hooks/useStore";
export { useElements } from "./hooks/useElements";
export { useUndoRedo } from "./hooks/useUndoRedo";
export { useZoom } from "./hooks/useZoom";
