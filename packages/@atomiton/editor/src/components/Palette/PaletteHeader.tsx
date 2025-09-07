import { styled } from "@atomiton/ui";
import type { PaletteHeaderProps } from "./Palette.types";

const PaletteHeaderStyled = styled("div", {
  name: "PaletteHeader",
})([
  "atomiton-palette-header",
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
 * Palette header with title and optional actions
 */
export function PaletteHeader({
  children,
  className,
  title,
  actions,
  ...props
}: PaletteHeaderProps) {
  return (
    <PaletteHeaderStyled className={className} {...props}>
      <div className="flex items-center gap-2">
        {title && <h3 className="font-semibold text-text-primary">{title}</h3>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </PaletteHeaderStyled>
  );
}
