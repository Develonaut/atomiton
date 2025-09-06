import { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Icon from "@/components/Icon";

import { options } from "./options";

type Props = {
  className?: string;
};

function SelectAi({ className }: Props) {
  const [value, setValue] = useState(options[0]);

  return (
    <Listbox
      className={`min-w-37 ${className || ""}`}
      value={value}
      onChange={setValue}
      as="div"
    >
      <ListboxButton className="group flex items-center gap-2 w-full h-10 px-3 rounded-xl text-heading transition-colors outline-0 data-[hover]:bg-surface-03 data-[open]:bg-surface-03">
        {value.title}
        <Icon
          className="shrink-0 ml-auto fill-secondary transition-transform group-[[data-open]]:rotate-180"
          name="chevron"
        />
      </ListboxButton>
      <ListboxOptions
        className={`z-100 w-51 [--anchor-gap:0.5rem] [--anchor-offset:0.875rem] p-2 bg-surface-01 border border-s-02 shadow-popover rounded-[1.25rem] origin-top transition ease-out outline-none data-[closed]:scale-95 data-[closed]:opacity-0 `}
        anchor="bottom"
        transition
        modal={false}
      >
        {options.map((option) => (
          <ListboxOption
            className="px-3 py-2.5 rounded-xl cursor-pointer transition-colors data-[focus]:bg-surface-02 data-[selected]:bg-surface-03"
            key={option.id}
            value={option}
          >
            <div className="text-body-lg font-medium">{option.title}</div>
            <div className="mt-1 text-body-sm text-secondary">
              {option.description}
            </div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}

export default SelectAi;
