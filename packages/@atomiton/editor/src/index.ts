/**
 * @atomiton/editor
 *
 * Visual flow editor components and React hooks
 * - Canvas and Editor UI components
 * - React hooks for node manipulation and viewport control
 * - TypeScript types for editor state
 */

export { default as Canvas } from "#components/Canvas";
export { default as Editor } from "#components/Editor";

export { useAddNode } from "#hooks/useAddNode";
export { useEditorNode } from "#hooks/useEditorNode";
export { useEditorNodes } from "#hooks/useEditorNodes";
export { useEditorViewport } from "#hooks/useEditorViewport";

export {
  getLayoutedElements,
  getNodesBounds,
  type LayoutDirection,
  type LayoutOptions,
} from "#utils/layout";

export type { ViewportOptions } from "#hooks/useEditorViewport";
export type { EditorNode, NodeData, NodePosition } from "#types/EditorNode";
