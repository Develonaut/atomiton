import { PropsWithChildren } from "react";

type SelectIconProps = PropsWithChildren<{
  className?: string;
}>;

function SelectIcon({ children, className = "" }: SelectIconProps) {
  return (
    <div
      className={`shrink-0 mr-1.5 [&_svg]:fill-secondary/70 [&_svg]:transition-colors group-hover:[&_svg]:fill-secondary ${className}`}
    >
      {children}
    </div>
  );
}

export default SelectIcon;
