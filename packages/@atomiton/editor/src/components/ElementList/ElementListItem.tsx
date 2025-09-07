import { styled } from "@atomiton/ui";
import type { ElementListItemProps } from "./ElementList.types";

const ElementListItemStyled = styled("div", {
  name: "ElementListItem",
})(
  [
    "flex",
    "items-center",
    "px-4",
    "py-2",
    "cursor-pointer",
    "transition-all",
    "duration-200",
    "hover:bg-surface-02",
    "group",
  ],
  {
    variants: {
      selected: {
        true: "bg-accent-primary/10 hover:bg-accent-primary/20",
        false: "",
      },
      depth: {
        0: "",
        1: "pl-8",
        2: "pl-12",
        3: "pl-16",
        4: "pl-20",
      },
    },
    defaultVariants: {
      selected: false,
      depth: 0,
    },
  },
);

const ItemExpandButtonStyled = styled("button", {
  name: "ElementListItemExpandButton",
})([
  "w-4",
  "h-4",
  "flex",
  "items-center",
  "justify-center",
  "transition-transform",
  "duration-200",
  "text-text-secondary",
  "hover:text-text-primary",
]);

const ItemContentStyled = styled("div", {
  name: "ElementListItemContent",
})("flex-1 flex items-center gap-2 min-w-0");

const ItemActionsStyled = styled("div", {
  name: "ElementListItemActions",
})(
  "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
);

/**
 * ElementList item
 */
export function ElementListItem({
  className,
  element,
  depth = 0,
  selected = false,
  expanded = false,
  showIcon = true,
  showDescription = false,
  showVisibility = true,
  showLock = true,
  onClick,
  onDoubleClick,
  onExpandToggle,
  onVisibilityToggle,
  onLockToggle,
  ...props
}: ElementListItemProps) {
  const hasChildren = element.children && element.children.length > 0;

  const handleOnClick = () => {
    onClick?.(element);
  };

  const handleOnDoubleClick = () => {
    onDoubleClick?.(element);
  };

  const handleOnExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onExpandToggle?.(element.id, !expanded);
    }
  };

  const handleOnVisibilityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVisibilityToggle?.(element.id, !element.visible);
  };

  const handleOnLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLockToggle?.(element.id, !element.locked);
  };

  return (
    <>
      <ElementListItemStyled
        className={className}
        selected={selected}
        depth={Math.min(depth, 4) as 0 | 1 | 2 | 3 | 4}
        onClick={handleOnClick}
        onDoubleClick={handleOnDoubleClick}
        data-element-id={element.id}
        data-element-type={element.type}
        data-selected={selected || undefined}
        data-expanded={expanded || undefined}
        {...props}
      >
        {/* Expand/collapse button */}
        {hasChildren && (
          <ItemExpandButtonStyled
            onClick={handleOnExpandClick}
            className={expanded ? "rotate-90" : ""}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            ▶
          </ItemExpandButtonStyled>
        )}
        {!hasChildren && <div className="w-4" />}

        {/* Icon */}
        {showIcon && element.icon && (
          <span className="w-5 h-5 flex items-center justify-center text-text-secondary">
            {element.icon}
          </span>
        )}

        {/* Content */}
        <ItemContentStyled>
          <span className="font-medium text-text-primary truncate">
            {element.label}
          </span>
          {showDescription && element.description && (
            <span className="text-xs text-text-secondary truncate">
              {element.description}
            </span>
          )}
        </ItemContentStyled>

        {/* Actions */}
        <ItemActionsStyled>
          {showVisibility && (
            <button
              onClick={handleOnVisibilityClick}
              className="w-4 h-4 flex items-center justify-center text-text-secondary hover:text-text-primary"
              aria-label={element.visible ? "Hide" : "Show"}
            >
              {element.visible ? "👁" : "🚫"}
            </button>
          )}
          {showLock && (
            <button
              onClick={handleOnLockClick}
              className="w-4 h-4 flex items-center justify-center text-text-secondary hover:text-text-primary"
              aria-label={element.locked ? "Unlock" : "Lock"}
            >
              {element.locked ? "🔒" : "🔓"}
            </button>
          )}
        </ItemActionsStyled>
      </ElementListItemStyled>

      {/* Render children recursively */}
      {hasChildren && expanded && (
        <>
          {element.children?.map((child) => (
            <ElementListItem
              key={child.id}
              element={child}
              depth={depth + 1}
              selected={selected}
              showIcon={showIcon}
              showDescription={showDescription}
              showVisibility={showVisibility}
              showLock={showLock}
              onClick={onClick}
              onDoubleClick={onDoubleClick}
              onExpandToggle={onExpandToggle}
              onVisibilityToggle={onVisibilityToggle}
              onLockToggle={onLockToggle}
            />
          ))}
        </>
      )}
    </>
  );
}
