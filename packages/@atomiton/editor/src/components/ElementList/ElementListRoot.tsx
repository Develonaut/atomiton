import { styled } from "@atomiton/ui";
import type { ElementListProps } from "./ElementList.types";

const ElementListStyled = styled("div", {
  name: "ElementList",
})([
  "atomiton-element-list",
  "flex",
  "flex-col",
  "h-full",
  "bg-surface-01",
  "border-r",
  "border-s-01",
  "overflow-hidden",
]);

/**
 * ElementList component - hierarchical list for organizing elements
 * Provides tree view, search, sorting, and selection functionality
 */
export function ElementListRoot({
  children,
  className,
  elements: _elements = [],
  groups: _groups = [],
  mode = "list",
  selectable = true,
  multiSelect = false,
  selectedIds: _selectedIds = [],
  searchQuery: _searchQuery = "",
  sortBy: _sortBy = "name",
  sortDirection: _sortDirection = "asc",
  showIcons: _showIcons = true,
  showDescriptions: _showDescriptions = false,
  showVisibility: _showVisibility = true,
  showLock: _showLock = true,
  onSearchChange,
  onSelectionChange,
  onElementClick,
  onElementDoubleClick,
  onVisibilityToggle,
  onLockToggle,
  onSortChange,
  ...props
}: ElementListProps) {
  return (
    <ElementListStyled
      className={className}
      data-mode={mode}
      data-selectable={selectable || undefined}
      data-multi-select={multiSelect || undefined}
      {...props}
    >
      {children}
    </ElementListStyled>
  );
}
