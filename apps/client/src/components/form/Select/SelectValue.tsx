import { PropsWithChildren } from "react";
import { useSelectContext } from "./SelectRoot";

type SelectValueProps = PropsWithChildren<{
  className?: string;
}>;

function SelectValue({ children, className = "" }: SelectValueProps) {
  const context = useSelectContext();

  if (!context?.value) {
    return null;
  }

  return (
    <div
      className={`flex items-center pr-2 truncate flex-1 text-secondary ${className}`}
    >
      {children}
    </div>
  );
}

export default SelectValue;
