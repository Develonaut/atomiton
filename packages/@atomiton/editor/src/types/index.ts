/**
 * Base props for styled components
 */
export interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}

// Export editor types
export * from "./editor.types";

// Re-export all component types (being selective to avoid conflicts)
export * from "../components/Canvas/Canvas.types";
export * from "../components/Connection/Connection.types";
export * from "../components/Editor/Editor";

// Element exports Size, so be selective
export {
  type ElementProps,
  type ElementContainerProps,
  type ElementBodyProps,
  type ElementHeaderProps,
  type ElementPortsProps,
  type ElementPortProps,
  type ElementBadgeProps,
  type ElementOverlayProps,
  type PortType,
  type PortPosition,
  type ElementState,
} from "../components/Element/Element.types";

export * from "../components/ElementList/ElementList.types";
export * from "../components/Inspector/Inspector.types";
export * from "../components/Palette/Palette.types";

// Panel exports Size and Side, so be selective
export {
  type PanelProps,
  type PanelHeaderProps,
  type PanelContentProps,
  type PanelFooterProps,
  type PanelSectionProps,
} from "../components/Panel/Panel.types";

// Toolbar exports Size, so be selective
export {
  type ToolbarProps,
  type ToolbarGroupProps,
  type ToolbarButtonProps,
  type ToolbarToggleProps,
  type ToolbarDropdownProps,
  type ToolbarSeparatorProps,
} from "../components/Toolbar/Toolbar.types";

// Export Size and Side from one place only (Panel)
export { type Size, type Side } from "../components/Panel/Panel.types";
