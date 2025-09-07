import type { StyleProps } from "@/types";

/**
 * Node/item type definition
 */
export interface NodeType {
  type: string;
  label: string;
  category: string;
  icon?: React.ReactNode;
  description?: string;
  data?: Record<string, unknown>;
}

/**
 * Category definition
 */
export interface CategoryType {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  collapsed?: boolean;
}

/**
 * Props for the root Palette component
 */
export interface PaletteProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Available nodes/items
   */
  nodes?: NodeType[];
  /**
   * Categories configuration
   */
  categories?: CategoryType[];
  /**
   * Search query
   */
  searchQuery?: string;
  /**
   * Called when search query changes
   */
  onSearchChange?: (query: string) => void;
  /**
   * Called when a node is dragged
   */
  onNodeDragStart?: (event: React.DragEvent, node: NodeType) => void;
  /**
   * Called when a node is selected
   */
  onNodeSelect?: (node: NodeType) => void;
}

/**
 * Props for Palette.Header sub-component
 */
export interface PaletteHeaderProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Header title
   */
  title?: string;
  /**
   * Optional actions in the header
   */
  actions?: React.ReactNode;
}

/**
 * Props for Palette.Search sub-component
 */
export interface PaletteSearchProps extends StyleProps {
  className?: string;
  /**
   * Search placeholder text
   */
  placeholder?: string;
  /**
   * Search value
   */
  value?: string;
  /**
   * Called when search value changes
   */
  onChange?: (value: string) => void;
  /**
   * Called when search is cleared
   */
  onClear?: () => void;
}

/**
 * Props for Palette.Categories sub-component
 */
export interface PaletteCategoriesProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Categories layout mode
   */
  layout?: "list" | "grid";
}

/**
 * Props for Palette.Category sub-component
 */
export interface PaletteCategoryProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Category title
   */
  title: string;
  /**
   * Category description
   */
  description?: string;
  /**
   * Category icon
   */
  icon?: React.ReactNode;
  /**
   * Category color theme
   */
  color?: string;
  /**
   * Whether category is collapsible
   */
  collapsible?: boolean;
  /**
   * Default collapsed state
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

/**
 * Props for Palette.Items sub-component
 */
export interface PaletteItemsProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Items layout mode
   */
  layout?: "list" | "grid";
  /**
   * Grid columns (when layout is grid)
   */
  columns?: 1 | 2 | 3 | 4;
}

/**
 * Props for Palette.Item sub-component
 */
export interface PaletteItemProps extends StyleProps {
  className?: string;
  /**
   * Item node data
   */
  node: NodeType;
  /**
   * Whether the item is selected
   */
  selected?: boolean;
  /**
   * Whether the item is draggable
   */
  draggable?: boolean;
  /**
   * Item display size
   */
  size?: "sm" | "md" | "lg";
  /**
   * Called when item is clicked
   */
  onClick?: (node: NodeType) => void;
  /**
   * Called when item is double-clicked
   */
  onDoubleClick?: (node: NodeType) => void;
  /**
   * Called when item drag starts
   */
  onDragStart?: (event: React.DragEvent, node: NodeType) => void;
}
