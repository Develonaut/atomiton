import Item from "#components/Assets/Item";

type Props = {
  title: string;
  tabs: {
    label: string;
    value: string;
  }[];
  sort: string;
  setSort: (sort: string) => void;
  items: {
    id: number;
    image: string;
  }[];
};

function Assets({ title, tabs, sort, setSort, items }: Props) {
  return (
    <div className="pt-5 px-12 pb-8 max-2xl:px-5">
      <div className="flex justify-between items-center mb-5 max-md:block">
        <div className="text-[1.25rem] leading-8 font-medium max-md:mb-3">
          {title}
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tabItem) => (
            <button
              className={`text-body-md h-9 px-5 border border-s-02 rounded-full text-primary transition-colors hover:bg-surface-03 max-md:h-8 max-md:px-3 ${
                tabItem.value === sort
                  ? "bg-surface-03 shadow-[0_2px_0px_rgba(255,255,255,0.80)_inset]"
                  : ""
              }`}
              onClick={() => setSort(tabItem.value)}
              key={tabItem.value}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap -mt-3 -mx-3">
        {items.map((item) => (
          <Item item={item} items={items} key={item.id} />
        ))}
      </div>
    </div>
  );
}

export default Assets;
