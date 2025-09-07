import { useState } from "react";
import { styled } from "@atomiton/ui";
import type { PanelSectionProps } from "./Panel.types";

const PanelSectionStyled = styled("div", {
  name: "PanelSection",
})(["border-b", "border-s-01", "last:border-b-0"]);

const PanelSectionHeaderStyled = styled("div", {
  name: "PanelSectionHeader",
})([
  "flex",
  "items-center",
  "justify-between",
  "px-4",
  "py-3",
  "cursor-pointer",
  "hover:bg-surface-02",
  "transition-colors",
]);

const PanelSectionContentStyled = styled("div", {
  name: "PanelSectionContent",
})(["overflow-hidden", "transition-all", "duration-200"], {
  variants: {
    collapsed: {
      true: "max-h-0",
      false: "max-h-none",
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

const PanelSectionChevronStyled = styled("span", {
  name: "PanelSectionChevron",
})(["text-text-secondary", "transition-transform"], {
  variants: {
    collapsed: {
      true: "rotate-0",
      false: "rotate-180",
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

/**
 * Panel section with optional collapsible functionality
 */
export function PanelSection({
  children,
  title,
  collapsible = false,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  ...props
}: PanelSectionProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapsed = () => {
    if (collapsible) {
      const newCollapsed = !collapsed;
      if (!isControlled) {
        setInternalCollapsed(newCollapsed);
      }
      onCollapsedChange?.(newCollapsed);
    }
  };

  return (
    <PanelSectionStyled
      data-collapsible={collapsible || undefined}
      data-collapsed={collapsed || undefined}
      {...props}
    >
      {title && (
        <PanelSectionHeaderStyled
          className={
            !collapsible ? "cursor-default hover:bg-transparent" : undefined
          }
          onClick={collapsible ? handleToggleCollapsed : undefined}
          role={collapsible ? "button" : undefined}
          aria-expanded={collapsible ? !collapsed : undefined}
        >
          <span className="font-medium text-text-primary">{title}</span>
          {collapsible && (
            <PanelSectionChevronStyled collapsed={collapsed}>
              {/* TODO: Import Icon from @atomiton/ui once available */}▼
            </PanelSectionChevronStyled>
          )}
        </PanelSectionHeaderStyled>
      )}

      <PanelSectionContentStyled collapsed={collapsed}>
        {children}
      </PanelSectionContentStyled>
    </PanelSectionStyled>
  );
}
