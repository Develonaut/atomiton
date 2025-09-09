/**
 * Base props for styled components
 */
export interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}

// Export editor types
export * from "./editor.types";

// Re-export all component types
export * from "../components/Canvas/Canvas.types";
export * from "../components/Editor/Editor";
