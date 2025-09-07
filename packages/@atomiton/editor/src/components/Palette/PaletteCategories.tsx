import { styled } from "@atomiton/ui";

const PaletteCategoriesStyled = styled("div", {
  name: "PaletteCategories",
})(["atomiton-palette-categories", "flex-1", "overflow-y-auto"]);

interface PaletteCategoriesProps {
  children?: React.ReactNode;
  className?: string;
}

export function PaletteCategories({
  children,
  className,
  ...props
}: PaletteCategoriesProps) {
  return (
    <PaletteCategoriesStyled className={className} {...props}>
      {children}
    </PaletteCategoriesStyled>
  );
}
