import { useState } from "react";
import { styled } from "@atomiton/ui";
import type { ElementListGroupProps } from "./ElementList.types";

const ElementListGroupStyled = styled("div", {
  name: "ElementListGroup",
})("border-b border-s-01");

const GroupHeaderStyled = styled("div", {
  name: "ElementListGroupHeader",
})([
  "flex",
  "items-center",
  "gap-2",
  "px-4",
  "py-2",
  "cursor-pointer",
  "hover:bg-surface-02",
  "transition-colors",
  "duration-200",
]);

const GroupContentStyled = styled("div", {
  name: "ElementListGroupContent",
})("transition-all duration-200", {
  variants: {
    collapsed: {
      true: "hidden",
      false: "block",
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

const GroupChevronStyled = styled("span", {
  name: "ElementListGroupChevron",
})(["text-text-secondary", "transition-transform"], {
  variants: {
    collapsed: {
      true: "",
      false: "rotate-90",
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

/**
 * ElementList group
 */
export function ElementListGroup({
  children,
  className,
  label,
  icon,
  color,
  count,
  collapsible = false,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  ...props
}: ElementListGroupProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleOnToggleCollapsed = () => {
    if (collapsible) {
      const newCollapsed = !collapsed;
      if (!isControlled) {
        setInternalCollapsed(newCollapsed);
      }
      onCollapsedChange?.(newCollapsed);
    }
  };

  return (
    <ElementListGroupStyled
      className={className}
      data-collapsible={collapsible || undefined}
      data-collapsed={collapsed || undefined}
      {...props}
    >
      <GroupHeaderStyled
        onClick={collapsible ? handleOnToggleCollapsed : undefined}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
      >
        {collapsible && (
          <GroupChevronStyled collapsed={collapsed}>▶</GroupChevronStyled>
        )}

        {color && (
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}

        {icon && <span className="text-text-secondary">{icon}</span>}

        <span className="flex-1 font-medium text-text-primary">{label}</span>

        {count !== undefined && (
          <span className="text-xs text-text-secondary">({count})</span>
        )}
      </GroupHeaderStyled>

      <GroupContentStyled collapsed={collapsed}>{children}</GroupContentStyled>
    </ElementListGroupStyled>
  );
}
