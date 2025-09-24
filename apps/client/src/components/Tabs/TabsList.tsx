import { useTabsContext } from "#TabsRoot";
import type { PropsWithChildren } from "react";
import { Children, isValidElement } from "react";

type TabsListProps = PropsWithChildren<{
  className?: string;
}>;

function TabsList({ children, className = "" }: TabsListProps) {
  const { isMedium, value } = useTabsContext();
  const childrenArray = Children.toArray(children);

  // Calculate active index based on current value
  const activeIndex = childrenArray.findIndex(
    (child) =>
      isValidElement(child) &&
      (child as React.ReactElement<{ value?: string | number }>).props
        ?.value === value,
  );

  const tabCount = childrenArray.length;
  const tabWidth =
    tabCount === 3 ? "w-1/3" : tabCount === 2 ? "w-1/2" : "w-1/4";

  return (
    <div
      className={`p-0.75 border border-s-02 bg-surface-03 rounded-xl ${
        isMedium ? "" : "shadow-[inset_0px_1px_2px_0_rgba(50,50,50,0.10)]"
      } ${className}`}
    >
      <div className="relative flex">
        <div
          className={`absolute top-0 left-0 bottom-0 rounded-lg bg-surface-01 shadow-[0_1.25px_3px_0px_rgba(50,50,50,0.10)),inset_0px_1.25px_1px_0px_#FFF] transition-transform duration-200 ${tabWidth}`}
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {children}
      </div>
    </div>
  );
}

export default TabsList;
