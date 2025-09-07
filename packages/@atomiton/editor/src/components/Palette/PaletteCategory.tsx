import { useState } from "react";
import { styled } from "@atomiton/ui";

const PaletteCategoryStyled = styled("div", {
  name: "PaletteCategory",
})(["atomiton-palette-category", "border-b", "border-s-01"]);

const CategoryHeaderStyled = styled("div", {
  name: "PaletteCategoryHeader",
})(["px-4", "py-2", "cursor-pointer", "hover:bg-surface-02", "font-medium"]);

interface PaletteCategoryProps {
  title: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function PaletteCategory({
  title,
  collapsible = true,
  defaultCollapsed = false,
  children,
  className,
  ...props
}: PaletteCategoryProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <PaletteCategoryStyled className={className} {...props}>
      <CategoryHeaderStyled
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        {collapsible && (
          <span
            className={`inline-block mr-2 transition-transform ${collapsed ? "" : "rotate-90"}`}
          >
            ▶
          </span>
        )}
        {title}
      </CategoryHeaderStyled>
      {!collapsed && <div className="px-4 py-2">{children}</div>}
    </PaletteCategoryStyled>
  );
}
