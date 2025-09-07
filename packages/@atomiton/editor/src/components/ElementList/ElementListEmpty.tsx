import { styled } from "@atomiton/ui";
import type { ElementListEmptyProps } from "./ElementList.types";

const ElementListEmptyStyled = styled("div", {
  name: "ElementListEmpty",
})([
  "atomiton-element-list-empty",
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "h-full",
  "p-8",
  "text-center",
]);

const EmptyIconStyled = styled("div", {
  name: "ElementListEmptyIcon",
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
  name: "ElementListEmptyTitle",
})("font-semibold text-text-primary mb-2");

const EmptyDescriptionStyled = styled("p", {
  name: "ElementListEmptyDescription",
})("text-sm text-text-secondary");

/**
 * ElementList empty state
 */
export function ElementListEmpty({
  children,
  className,
  icon,
  title = "No Elements",
  description = "No elements to display",
  actions,
  ...props
}: ElementListEmptyProps) {
  return (
    <ElementListEmptyStyled className={className} {...props}>
      {icon && <EmptyIconStyled>{icon}</EmptyIconStyled>}

      <EmptyTitleStyled>{title}</EmptyTitleStyled>

      <EmptyDescriptionStyled>{description}</EmptyDescriptionStyled>

      {children}

      {actions && <div className="flex items-center gap-2 mt-4">{actions}</div>}
    </ElementListEmptyStyled>
  );
}
