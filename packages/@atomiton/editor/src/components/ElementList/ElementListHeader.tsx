import { styled } from "@atomiton/ui";
import type { ElementListHeaderProps } from "./ElementList.types";

const ElementListHeaderStyled = styled("div", {
  name: "ElementListHeader",
})([
  "atomiton-element-list-header",
  "flex",
  "items-center",
  "justify-between",
  "px-4",
  "py-3",
  "border-b",
  "border-s-01",
  "bg-surface-02",
]);

/**
 * ElementList header with title and actions
 */
export function ElementListHeader({
  children,
  className,
  title,
  count,
  actions,
  ...props
}: ElementListHeaderProps) {
  return (
    <ElementListHeaderStyled className={className} {...props}>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {count !== undefined && (
          <span className="text-xs text-text-secondary">({count})</span>
        )}
        {children}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </ElementListHeaderStyled>
  );
}
