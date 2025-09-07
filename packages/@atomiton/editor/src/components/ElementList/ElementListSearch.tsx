import { styled } from "@atomiton/ui";
import type { ElementListSearchProps } from "./ElementList.types";

const ElementListSearchStyled = styled("div", {
  name: "ElementListSearch",
})(["atomiton-element-list-search", "px-4", "py-2", "border-b", "border-s-01"]);

const SearchInputStyled = styled("input", {
  name: "ElementListSearchInput",
})([
  "w-full",
  "px-3",
  "py-2",
  "text-sm",
  "rounded",
  "border",
  "border-s-01",
  "bg-surface-01",
  "placeholder-text-secondary",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-accent-primary/30",
  "focus:border-accent-primary",
]);

/**
 * ElementList search input
 */
export function ElementListSearch({
  className,
  value,
  placeholder = "Search...",
  onChange,
  onClear,
  ...props
}: ElementListSearchProps) {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <ElementListSearchStyled className={className} {...props}>
      <SearchInputStyled
        type="text"
        value={value || ""}
        placeholder={placeholder}
        onChange={handleOnChange}
        data-has-value={!!value || undefined}
      />
    </ElementListSearchStyled>
  );
}
