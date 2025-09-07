import { styled } from "@atomiton/ui";
import type { PanelHeaderProps } from "./Panel.types";

const PanelHeaderStyled = styled("div", {
  name: "PanelHeader",
})([
  "atomiton-panel-header",
  "flex",
  "items-center",
  "justify-between",
  "px-4",
  "py-3",
  "border-b",
  "border-s-01",
  "bg-surface-01",
  "rounded-t-[1.25rem]",
]);

/**
 * Panel header with title and optional actions
 */
export function PanelHeader({
  children,
  title,
  actions,
  closable = false,
  onClose,
  ...props
}: PanelHeaderProps) {
  return (
    <PanelHeaderStyled {...props}>
      <div className="flex items-center gap-2">
        {title && <h3 className="font-medium text-text-primary">{title}</h3>}
        {children}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {closable && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-02 transition-colors"
            aria-label="Close panel"
          >
            {/* TODO: Import Icon from @atomiton/ui once available */}
            <span className="text-text-secondary">×</span>
          </button>
        )}
      </div>
    </PanelHeaderStyled>
  );
}
