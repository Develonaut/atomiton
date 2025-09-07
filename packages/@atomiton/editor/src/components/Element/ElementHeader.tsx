import { styled } from "@atomiton/ui";
import type { ElementHeaderProps } from "./Element.types";

const ElementHeaderStyled = styled("div", {
  name: "ElementHeader",
})([
  "atomiton-element-header",
  "flex",
  "items-center",
  "justify-between",
  "px-3",
  "py-2",
  "border-b",
  "border-s-01",
  "bg-surface-02",
  "rounded-t-lg",
  "text-sm",
  "font-medium",
  "text-text-primary",
]);

/**
 * Element header - title/label area
 */
export function ElementHeader({
  children,
  className,
  title,
  icon,
  actions,
  ...props
}: ElementHeaderProps) {
  return (
    <ElementHeaderStyled className={className} {...props}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {title && <span className="truncate">{title}</span>}
        {children}
      </div>

      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>
      )}
    </ElementHeaderStyled>
  );
}
