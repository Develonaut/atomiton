import type { PropsWithChildren } from "react";

type SelectLabelProps = PropsWithChildren<{
  className?: string;
}>;

function SelectLabel({ children, className = "" }: SelectLabelProps) {
  return (
    <div className={`shrink-0 pr-2 text-primary ${className}`}>{children}</div>
  );
}

export default SelectLabel;
