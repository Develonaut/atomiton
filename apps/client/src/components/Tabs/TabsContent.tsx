import type { PropsWithChildren } from "react";
import { useTabsContext } from "./TabsRoot";

type TabsContentProps = PropsWithChildren<{
  value: string | number;
  className?: string;
}>;

function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();

  if (activeValue !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
}

export default TabsContent;
