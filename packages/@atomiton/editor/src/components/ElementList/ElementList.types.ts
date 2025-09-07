import type { StyleProps } from "@/types";

/**
 * Element/item definition for list display
 */
export interface ListElement {
  id: string;
  label: string;
  type: string;
  category?: string;
  icon?: React.ReactNode;
  description?: string;
  visible?: boolean;
  locked?: boolean;
  selected?: boolean;
  parentId?: string;
  children?: ListElement[];
  data?: Record<string, unknown>;
}

/**
 * Group definition for organizing elements
 */
export interface ElementGroup {
  id: string;
  label: string;
  elements: ListElement[];
  collapsed?: boolean;
  color?: string;
}

/**
 * Sort options for element list
 */
export type SortOption = "name" | "type" | "created" | "modified";
export type SortDirection = "asc" | "desc";

/**
 * Display mode for the element list
 */
export type DisplayMode = "list" | "tree" | "grid";

/**
 * Props for the root ElementList component
 */
export interface ElementListProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Elements to display
   */
  elements?: ListElement[];
  /**
   * Element groups for organization
   */
  groups?: ElementGroup[];
  /**
   * Display mode
   */
  mode?: DisplayMode;
  /**
   * Whether elements are selectable
   */
  selectable?: boolean;
  /**
   * Whether multiple selection is allowed
   */
  multiSelect?: boolean;
  /**
   * Selected element IDs
   */
  selectedIds?: string[];
  /**
   * Search query for filtering
   */
  searchQuery?: string;
  /**
   * Sort configuration
   */
  sortBy?: SortOption;
  sortDirection?: SortDirection;
  /**
   * Whether to show element icons
   */
  showIcons?: boolean;
  /**
   * Whether to show element descriptions
   */
  showDescriptions?: boolean;
  /**
   * Whether to show visibility toggles
   */
  showVisibility?: boolean;
  /**
   * Whether to show lock toggles
   */
  showLock?: boolean;
  /**
   * Called when search query changes
   */
  onSearchChange?: (query: string) => void;
  /**
   * Called when elements are selected
   */
  onSelectionChange?: (selectedIds: string[]) => void;
  /**
   * Called when an element is clicked
   */
  onElementClick?: (element: ListElement) => void;
  /**
   * Called when an element is double-clicked
   */
  onElementDoubleClick?: (element: ListElement) => void;
  /**
   * Called when element visibility is toggled
   */
  onVisibilityToggle?: (elementId: string, visible: boolean) => void;
  /**
   * Called when element lock is toggled
   */
  onLockToggle?: (elementId: string, locked: boolean) => void;
  /**
   * Called when sort changes
   */
  onSortChange?: (sortBy: SortOption, direction: SortDirection) => void;
}

/**
 * Props for ElementList.Header sub-component
 */
export interface ElementListHeaderProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Header title
   */
  title?: string;
  /**
   * Element count info
   */
  count?: number;
  /**
   * Optional actions in the header
   */
  actions?: React.ReactNode;
}

/**
 * Props for ElementList.Search sub-component
 */
export interface ElementListSearchProps extends StyleProps {
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
 * Props for ElementList.Tree sub-component
 */
export interface ElementListTreeProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Tree display mode
   */
  mode?: DisplayMode;
  /**
   * Tree indentation size
   */
  indentSize?: number;
}

/**
 * Props for ElementList.Item sub-component
 */
export interface ElementListItemProps extends StyleProps {
  className?: string;
  /**
   * Element data
   */
  element: ListElement;
  /**
   * Tree depth level (for indentation)
   */
  depth?: number;
  /**
   * Whether the item is selected
   */
  selected?: boolean;
  /**
   * Whether the item is expanded (for tree nodes)
   */
  expanded?: boolean;
  /**
   * Display options
   */
  showIcon?: boolean;
  showDescription?: boolean;
  showVisibility?: boolean;
  showLock?: boolean;
  /**
   * Called when item is clicked
   */
  onClick?: (element: ListElement) => void;
  /**
   * Called when item is double-clicked
   */
  onDoubleClick?: (element: ListElement) => void;
  /**
   * Called when expand/collapse is toggled
   */
  onExpandToggle?: (elementId: string, expanded: boolean) => void;
  /**
   * Called when visibility is toggled
   */
  onVisibilityToggle?: (elementId: string, visible: boolean) => void;
  /**
   * Called when lock is toggled
   */
  onLockToggle?: (elementId: string, locked: boolean) => void;
}

/**
 * Props for ElementList.Group sub-component
 */
export interface ElementListGroupProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Group label
   */
  label: string;
  /**
   * Group icon
   */
  icon?: React.ReactNode;
  /**
   * Group color theme
   */
  color?: string;
  /**
   * Whether the group is collapsible
   */
  collapsible?: boolean;
  /**
   * Default collapsed state
   */
  defaultCollapsed?: boolean;
  /**
   * Whether the group is collapsed
   */
  collapsed?: boolean;
  /**
   * Element count in group
   */
  count?: number;
  /**
   * Called when collapsed state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Props for ElementList.Empty sub-component
 */
export interface ElementListEmptyProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Empty state icon
   */
  icon?: React.ReactNode;
  /**
   * Empty state title
   */
  title?: string;
  /**
   * Empty state description
   */
  description?: string;
  /**
   * Optional actions for empty state
   */
  actions?: React.ReactNode;
}
