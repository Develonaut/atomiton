import { useState } from "react";
import { styled } from "@atomiton/ui";
import type { InspectorSectionProps } from "./Inspector.types";

const InspectorSectionStyled = styled("div", {
  name: "InspectorSection",
})("");

const SectionHeaderStyled = styled("div", {
  name: "InspectorSectionHeader",
})([
  "px-4",
  "py-3",
  "cursor-pointer",
  "hover:bg-surface-02",
  "transition-colors",
  "duration-200",
]);

const SectionContentStyled = styled("div", {
  name: "InspectorSectionContent",
})(["space-y-4", "px-4", "py-3", "transition-all", "duration-200"], {
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

const SectionChevronStyled = styled("span", {
  name: "InspectorSectionChevron",
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
 * Inspector section with optional collapsible functionality
 */
export function InspectorSection({
  children,
  className,
  title,
  description,
  icon,
  collapsible = false,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  ...props
}: InspectorSectionProps) {
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
    <InspectorSectionStyled
      className={className}
      data-collapsible={collapsible || undefined}
      data-collapsed={collapsed || undefined}
      {...props}
    >
      <SectionHeaderStyled
        className={
          !collapsible ? "cursor-default hover:bg-transparent" : undefined
        }
        onClick={collapsible ? handleOnToggleCollapsed : undefined}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-text-primary">{title}</span>
            {description && (
              <p className="text-xs text-text-secondary">{description}</p>
            )}
          </div>
        </div>

        {collapsible && (
          <SectionChevronStyled collapsed={collapsed}>
            {/* TODO: Import Icon from @atomiton/ui once available */}▼
          </SectionChevronStyled>
        )}
      </SectionHeaderStyled>

      <SectionContentStyled collapsed={collapsed}>
        {children}
      </SectionContentStyled>
    </InspectorSectionStyled>
  );
}
