import { styled } from "@atomiton/ui";
import type { InspectorHeaderProps } from "./Inspector.types";

const InspectorHeaderStyled = styled("div", {
  name: "InspectorHeader",
})([
  "atomiton-inspector-header",
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
 * Inspector header with title and actions
 */
export function InspectorHeader({
  children,
  className,
  title,
  subtitle,
  icon,
  actions,
  ...props
}: InspectorHeaderProps) {
  return (
    <InspectorHeaderStyled className={className} {...props}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold text-text-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-text-secondary truncate">{subtitle}</p>
          )}
        </div>
        {children}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </InspectorHeaderStyled>
  );
}
