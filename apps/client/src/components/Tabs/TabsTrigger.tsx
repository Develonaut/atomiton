import type { PropsWithChildren } from "react";
import { useTabsContext } from "./TabsRoot";

type TabsTriggerProps = PropsWithChildren<{
  value: string | number;
  className?: string;
  onClick?: () => void;
}>;

function TabsTrigger({
  value,
  children,
  className = "",
  onClick,
}: TabsTriggerProps) {
  const { value: activeValue, onChange, isMedium } = useTabsContext();
  const isActive = activeValue === value;

  const handleClick = () => {
    onChange(value);
    onClick?.();
  };

  return (
    <button
      className={`relative z-1 flex-1 transition-colors hover:text-primary ${
        isActive ? "text-primary" : "text-secondary"
      } ${
        isMedium ? "h-7 text-body-md-str" : "h-8 text-body-lg-str"
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export default TabsTrigger;
