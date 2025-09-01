import { useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import Icon from "@/components/Icon";

import { itemsType, itemsSort } from "./items";

type ItemProps = {
  id?: number;
  title: string;
  active: boolean;
  onClick: () => void;
};

const Item = ({ title, active, onClick }: ItemProps) => {
  return (
    <MenuItem
      className="flex items-center w-full h-9 px-2.5 rounded-[0.625rem] cursor-pointer transition-colors data-focus:bg-surface-03"
      onClick={onClick}
      as="button"
    >
      <Icon
        className={`!size-4 mr-2 fill-secondary transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
        name="check"
      />
      {title}
    </MenuItem>
  );
};

type Props = {
  onlyBtnIcon?: boolean;
};

const Filters = ({ onlyBtnIcon }: Props) => {
  const [type, setType] = useState(0);
  const [sort, setSort] = useState(0);

  return (
    <Menu>
      <MenuButton
        className={`group h-10 border border-transparent rounded-[0.625rem] text-body-md transition-colors outline-0 ${
          onlyBtnIcon
            ? "w-10 hover:bg-surface-03 data-open:bg-surface-03"
            : "flex items-center min-w-34.5 px-3 data-open:border-s-02 data-open:bg-surface-02"
        }`}
      >
        <Icon
          className={
            onlyBtnIcon
              ? "fill-primary"
              : "!size-4 mr-2 fill-secondary/70 transition-colors group-hover:fill-primary/70"
          }
          name="filter"
        />
        {!onlyBtnIcon && (
          <>
            <div className="mr-3.5">
              {type === 0 ? "All scenes" : type === 1 ? "Designs" : "Animation"}
            </div>
            <Icon
              className="!size-4 ml-auto transition-transform group-[[data-open]]:rotate-180"
              name="chevron"
            />
          </>
        )}
      </MenuButton>
      <MenuItems
        className={`z-20 w-43 p-2 bg-shade-01 [--anchor-gap:0.5rem] border border-s-01 rounded-2xl shadow-popover origin-top transition outline-0 data-closed:scale-95 data-closed:opacity-0 ${
          onlyBtnIcon
            ? "[--anchor-offset:1rem]"
            : "[--anchor-offset:-0.375rem] max-2xl:[--anchor-offset:-2rem]"
        }`}
        anchor={onlyBtnIcon ? "bottom end" : "bottom start"}
        transition
        modal={false}
      >
        {itemsType.map((item) => (
          <Item
            key={item.id}
            title={item.title}
            onClick={() => setType(item.id)}
            active={type === item.id}
          />
        ))}
        <MenuSeparator className="-mx-2 my-2 h-0.25 bg-s-01" />
        {itemsSort.map((item) => (
          <Item
            key={item.id}
            title={item.title}
            onClick={() => setSort(item.id)}
            active={sort === item.id}
          />
        ))}
      </MenuItems>
    </Menu>
  );
};

export default Filters;
