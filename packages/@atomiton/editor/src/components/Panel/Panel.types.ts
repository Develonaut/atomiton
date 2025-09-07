import type { StyleProps } from "@/types";

/**
 * Standard positioning values used across all positioned components
 */
export type Side = "top" | "right" | "bottom" | "left";

/**
 * Standard size values using t-shirt sizing
 */
export type Size = "sm" | "md" | "lg";

/**
 * Props for the root Panel component
 */
export interface PanelProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Side of the screen to position the panel
   */
  side?: Side;
  /**
   * Size of the panel using t-shirt sizes
   */
  size?: Size;
  /**
   * Whether the panel is visible/open
   */
  open?: boolean;
  /**
   * Panel title for accessibility
   */
  title?: string;
  /**
   * Whether the panel content is scrollable
   */
  scrollable?: boolean;
  /**
   * Called when panel should be closed (mobile overlay click)
   */
  onClose?: () => void;
}

/**
 * Props for Panel.Header sub-component
 */
export interface PanelHeaderProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Header title text
   */
  title?: string;
  /**
   * Optional actions to display in the header (buttons, etc.)
   */
  actions?: React.ReactNode;
  /**
   * Whether to show a close button
   */
  closable?: boolean;
  /**
   * Called when close button is clicked
   */
  onClose?: () => void;
}

/**
 * Props for Panel.Content sub-component
 */
export interface PanelContentProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether the content area is scrollable
   */
  scrollable?: boolean;
  /**
   * Padding size using t-shirt sizes
   */
  padding?: Size;
}

/**
 * Props for Panel.Footer sub-component
 */
export interface PanelFooterProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Alignment of footer content
   */
  align?: "left" | "center" | "right" | "between";
}

/**
 * Props for Panel.Section sub-component
 */
export interface PanelSectionProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Section title
   */
  title?: string;
  /**
   * Whether the section is collapsible
   */
  collapsible?: boolean;
  /**
   * Default collapsed state for collapsible sections
   */
  defaultCollapsed?: boolean;
  /**
   * Controlled collapsed state
   */
  collapsed?: boolean;
  /**
   * Called when collapsed state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
}
