import { PropsWithChildren } from "react";
import { useSelectContext } from "./SelectRoot";

type SelectPlaceholderProps = PropsWithChildren<{
  className?: string;
}>;

function SelectPlaceholder({
  children = "Select...",
  className = "",
}: SelectPlaceholderProps) {
  const context = useSelectContext();

  if (context?.value) {
    return null;
  }

  return (
    <div
      className={`flex items-center pr-2 truncate text-secondary/80 flex-1 ${className}`}
    >
      {children}
    </div>
  );
}

export default SelectPlaceholder;
