import type { StyleProps } from "@/types";

/**
 * Standard size values using t-shirt sizing
 */
export type Size = "sm" | "md" | "lg";

/**
 * Props for the root Toolbar component
 */
export interface ToolbarProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Horizontal position of the toolbar
   */
  horizontalPosition?: "left" | "center" | "right";
  /**
   * Vertical position of the toolbar
   */
  verticalPosition?: "top" | "bottom";
  /**
   * Size of the toolbar using t-shirt sizes
   */
  size?: Size;
  /**
   * Toolbar title for accessibility
   */
  title?: string;
}

/**
 * Props for Toolbar.Group sub-component
 */
export interface ToolbarGroupProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Group title for accessibility
   */
  title?: string;
  /**
   * Spacing between items in the group
   */
  spacing?: Size;
}

/**
 * Props for Toolbar.Button sub-component
 */
export interface ToolbarButtonProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Button icon (when using icon-only buttons)
   */
  icon?: React.ReactNode;
  /**
   * Button tooltip text
   */
  tooltip?: string;
  /**
   * Button size
   */
  size?: Size;
  /**
   * Button variant styling
   */
  variant?: "ghost" | "filled" | "outline";
  /**
   * Whether the button is in an active/pressed state
   */
  active?: boolean;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Button type for forms
   */
  type?: "button" | "submit" | "reset";
}

/**
 * Props for Toolbar.Separator sub-component
 */
export interface ToolbarSeparatorProps extends StyleProps {
  className?: string;
  /**
   * Orientation of the separator
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * Props for Toolbar.Dropdown sub-component
 */
export interface ToolbarDropdownProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Dropdown trigger content
   */
  trigger: React.ReactNode;
  /**
   * Dropdown size
   */
  size?: Size;
  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;
  /**
   * Side to align the dropdown content
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Alignment within the side
   */
  align?: "start" | "center" | "end";
}

/**
 * Props for Toolbar.Toggle sub-component
 */
export interface ToolbarToggleProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Toggle icon (when using icon-only toggles)
   */
  icon?: React.ReactNode;
  /**
   * Toggle tooltip text
   */
  tooltip?: string;
  /**
   * Toggle size
   */
  size?: Size;
  /**
   * Toggle variant styling
   */
  variant?: "ghost" | "filled" | "outline";
  /**
   * Whether the toggle is pressed/active
   */
  pressed?: boolean;
  /**
   * Default pressed state (uncontrolled)
   */
  defaultPressed?: boolean;
  /**
   * Whether the toggle is disabled
   */
  disabled?: boolean;
  /**
   * Called when pressed state changes
   */
  onPressedChange?: (pressed: boolean) => void;
}
