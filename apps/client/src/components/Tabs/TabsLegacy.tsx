import { TabItem } from "@/types";

type TabsLegacyProps = {
  className?: string;
  classButton?: string;
  items: TabItem[];
  value: TabItem;
  setValue: (value: TabItem) => void;
  isMedium?: boolean;
};

/**
 * Legacy Tabs component for backward compatibility
 * Use the new composition API (Tabs.List, Tabs.Trigger, etc.) for new code
 */
function TabsLegacy({
  className,
  classButton,
  items,
  value,
  setValue,
  isMedium,
}: TabsLegacyProps) {
  return (
    <div
      className={`p-0.75 border border-s-02 bg-surface-03 rounded-xl ${
        isMedium ? "" : "shadow-[inset_0px_1px_2px_0_rgba(50,50,50,0.10)]"
      } ${className || ""}`}
    >
      <div className="relative flex">
        <div
          className={`absolute top-0 left-0 bottom-0 rounded-lg bg-surface-01 shadow-[0_1.25px_3px_0px_rgba(50,50,50,0.10)),inset_0px_1.25px_1px_0px_#FFF] transition-transform ${
            items.length === 3
              ? "w-1/3"
              : items.length === 2
                ? "w-1/2"
                : "w-1/4"
          }`}
          style={{
            transform: `translateX(${items.findIndex((item) => item.id === value.id) * 100}%)`,
          }}
        />
        {items.map((item) => (
          <button
            className={`relative z-1 flex-1 transition-colors hover:text-primary ${
              value.id === item.id ? "text-primary" : "text-secondary"
            } ${
              isMedium ? "h-7 text-body-md-str" : "h-8 text-body-lg-str"
            } ${classButton || ""}`}
            key={item.id}
            onClick={() => {
              setValue(item);
              item.onClick?.();
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabsLegacy;
