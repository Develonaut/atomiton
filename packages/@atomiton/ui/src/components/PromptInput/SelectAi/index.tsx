import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useState } from "react";

import { options } from "#components/PromptInput/SelectAi/options";

type AiOption = {
  id: number;
  title: string;
  description: string;
};

type Props = {
  className?: string;
};

function SelectAi({ className }: Props) {
  const [value, setValue] = useState<AiOption>(
    options[0] ?? { id: 0, title: "Default", description: "Default AI" },
  );

  return (
    <Listbox
      className={`min-w-37 ${className || ""}`}
      value={value}
      onChange={setValue}
      as="div"
    >
      <ListboxButton className="group flex items-center gap-2 w-full h-10 px-3 rounded-xl text-[0.875rem] font-medium transition-colors cursor-pointer data-[hover]:bg-[#f1f1f1] data-[open]:bg-[#f1f1f1]">
        {value.title}
        <svg
          className="size-4 shrink-0 ml-auto fill-[#7b7b7b] transition-transform group-[[data-open]]:rotate-180"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M11.371 12.38c-.757.827-1.985.827-2.742 0l-3.36-3.668a1.07 1.07 0 0 1 0-1.418c.359-.392.94-.392 1.299 0l3.36 3.668c.04.044.104.044.144 0l3.36-3.668c.359-.392.94-.392 1.299 0a1.07 1.07 0 0 1 0 1.418l-3.36 3.668z" />
        </svg>
      </ListboxButton>
      <ListboxOptions
        className={`z-100 w-51 [--anchor-gap:0.5rem] [--anchor-offset:0.875rem] p-2 bg-[#fcfcfc] border border-[#e2e2e2] shadow-[0px_0px_0px_2px_#FFF_inset,0px_39px_24px_0px_rgba(0,0,0,0.03),0px_18px_18px_0px_rgba(0,0,0,0.05),0px_4px_10px_0px_rgba(0,0,0,0.06)] rounded-[1.25rem] origin-top transition ease-out outline-none data-[closed]:scale-95 data-[closed]:opacity-0 `}
        anchor="bottom"
        transition
        modal={false}
      >
        {options.map((option) => (
          <ListboxOption
            className="px-3 py-2.5 rounded-xl cursor-pointer transition-colors data-[focus]:bg-[#f8f7f7] data-[selected]:bg-[#f1f1f1]"
            key={option.id}
            value={option}
          >
            <div className="text-[0.8125rem] leading-[1rem] font-medium">
              {option.title}
            </div>
            <div className="mt-1 text-[0.6875rem] leading-[1rem] font-medium text-[#7b7b7b]/70">
              {option.description}
            </div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}

export default SelectAi;
