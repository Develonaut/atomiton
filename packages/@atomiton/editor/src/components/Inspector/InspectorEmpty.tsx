import { styled } from "@atomiton/ui";
import type { InspectorEmptyProps } from "./Inspector.types";

const InspectorEmptyStyled = styled("div", {
  name: "InspectorEmpty",
})([
  "atomiton-inspector-empty",
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "h-full",
  "p-8",
  "text-center",
]);

const EmptyIconStyled = styled("div", {
  name: "InspectorEmptyIcon",
})([
  "w-16",
  "h-16",
  "mb-4",
  "flex",
  "items-center",
  "justify-center",
  "rounded-full",
  "bg-surface-02",
  "text-text-secondary",
]);

const EmptyTitleStyled = styled("h3", {
  name: "InspectorEmptyTitle",
})("font-semibold text-text-primary mb-2");

const EmptyDescriptionStyled = styled("p", {
  name: "InspectorEmptyDescription",
})("text-sm text-text-secondary");

/**
 * Inspector empty state - shown when no item is selected
 */
export function InspectorEmpty({
  children,
  className,
  icon,
  title = "Nothing Selected",
  description = "Select an item to view its properties",
  actions,
  ...props
}: InspectorEmptyProps) {
  return (
    <InspectorEmptyStyled className={className} {...props}>
      {icon && <EmptyIconStyled>{icon}</EmptyIconStyled>}

      <EmptyTitleStyled>{title}</EmptyTitleStyled>

      <EmptyDescriptionStyled>{description}</EmptyDescriptionStyled>

      {children}

      {actions && <div className="flex items-center gap-2 mt-4">{actions}</div>}
    </InspectorEmptyStyled>
  );
}
