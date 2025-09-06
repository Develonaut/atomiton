type TabItem = {
  id: number;
  name: string;
  onClick?: () => void;
};

type Props = {
  className?: string;
  classButton?: string;
  items: TabItem[];
  value: TabItem;
  setValue: (value: TabItem) => void;
  isMedium?: boolean;
};

function Tabs({
  className,
  classButton,
  items,
  value,
  setValue,
  isMedium,
}: Props) {
  return (
    <div
      className={`p-0.75 border border-[#e2e2e2] bg-[#f1f1f1] rounded-xl ${
        isMedium ? "" : "shadow-[inset_0px_1px_2px_0_rgba(50,50,50,0.10)]"
      } ${className || ""}`}
    >
      <div className="relative flex">
        <div
          className={`absolute top-0 left-0 bottom-0 rounded-lg bg-[#fcfcfc] shadow-[0_1.25px_3px_0px_rgba(50,50,50,0.10)),inset_0px_1.25px_1px_0px_#FFF] transition-transform ${
            items.length === 3 ? "w-1/3" : "w-1/2"
          } ${value.id === items[1]?.id ? "translate-x-full" : ""}`}
        ></div>
        {items.map((item) => (
          <button
            className={`relative z-1 flex-1 font-semibold transition-colors cursor-pointer hover:text-[#121212] ${
              value.id === item.id ? "text-[#121212]" : "text-[#7B7B7B]"
            } ${
              isMedium ? "h-7 text-[0.75rem]" : "h-8 text-[0.8125rem]"
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

export default Tabs;
