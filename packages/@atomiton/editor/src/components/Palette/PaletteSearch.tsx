import { styled } from "@atomiton/ui";

const PaletteSearchStyled = styled("div", {
  name: "PaletteSearch",
})(["atomiton-palette-search", "px-4", "py-2", "border-b", "border-s-01"]);

interface PaletteSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function PaletteSearch({
  placeholder = "Search...",
  value,
  onChange,
  className,
  ...props
}: PaletteSearchProps) {
  return (
    <PaletteSearchStyled className={className} {...props}>
      <input
        type="text"
        className="w-full px-3 py-2 text-sm rounded border border-s-01 bg-surface-01 placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </PaletteSearchStyled>
  );
}
