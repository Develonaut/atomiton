import { PropsWithChildren } from "react";

type SwitchLabelProps = PropsWithChildren<{
  className?: string;
}>;

function SwitchLabel({ children, className = "" }: SwitchLabelProps) {
  return (
    <label className={`text-sm text-primary ${className}`}>{children}</label>
  );
}

export default SwitchLabel;
