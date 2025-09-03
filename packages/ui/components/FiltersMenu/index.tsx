import { useState } from "react";

import { itemsType, itemsSort } from "./items";

type ItemProps = {
  id?: number;
  title: string;
  active: boolean;
  onClick: () => void;
};

const Item = ({ title, active, onClick }: ItemProps) => {
  return (
    <button
      className="flex items-center w-full h-9 px-2.5 rounded-[0.625rem] text-[0.75rem] font-medium cursor-pointer transition-colors hover:bg-[#f1f1f1]"
      onClick={onClick}
    >
      <svg
        className={`size-4 mr-2 fill-[#7B7B7B] transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
        width={20}
        height={20}
        viewBox="0 0 20 20"
      >
        <path d="M15.384 4.343a.89.89 0 0 1 1.286-.126c.388.334.443.931.121 1.334L8.729 15.657a.89.89 0 0 1-1.246.157L3.37 12.656a.97.97 0 0 1-.191-1.325.89.89 0 0 1 1.277-.198l3.417 2.623 7.51-9.413z" />
      </svg>
      {title}
    </button>
  );
};

const FiltersMenu = () => {
  const [type, setType] = useState(0);
  const [sort, setSort] = useState(0);

  return (
    <div className="w-45 p-2 bg-[#FCFCFC] border border-[#ECECEC] rounded-2xl shadow-2xl">
      {itemsType.map((item) => (
        <Item
          key={item.id}
          title={item.title}
          onClick={() => setType(item.id)}
          active={type === item.id}
        />
      ))}
      <div className="-mx-2 my-2 h-0.25 bg-[#E2E2E2]" />
      {itemsSort.map((item) => (
        <Item
          key={item.id}
          title={item.title}
          onClick={() => setSort(item.id)}
          active={sort === item.id}
        />
      ))}
    </div>
  );
};

export default FiltersMenu;
