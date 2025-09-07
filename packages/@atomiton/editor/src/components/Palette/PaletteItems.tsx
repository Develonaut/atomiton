import { styled } from "@atomiton/ui";

const PaletteItemsStyled = styled("div", {
  name: "PaletteItems",
})(["atomiton-palette-items", "grid", "grid-cols-2", "gap-2"]);

interface PaletteItemsProps {
  children?: React.ReactNode;
  className?: string;
}

export function PaletteItems({
  children,
  className,
  ...props
}: PaletteItemsProps) {
  return (
    <PaletteItemsStyled className={className} {...props}>
      {children}
    </PaletteItemsStyled>
  );
}
