import { useState } from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  CloseButton,
} from "@headlessui/react";
import Icon from "@/components/Icon";
import Image from "@/components/Image";

import { content } from "./content";

type Props = {
  onClick: () => void;
};

function Variations({ onClick }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Popover className="relative">
      <PopoverButton
        className="group opacity-0 transition-opacity outline-0 group-hover/item:opacity-100 data-open:opacity-100"
        onClick={onClick}
      >
        <Icon
          className="!size-4 fill-secondary transition-colors group-hover:fill-primary group-[[data-open]]:fill-primary"
          name="sparkle"
        />
      </PopoverButton>
      <PopoverPanel
        className="[--anchor-gap:2rem] [--anchor-offset:-1rem] z-50 w-52 p-4 pt-3 bg-shade-01 rounded-[1.25rem] shadow-popover transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0"
        anchor={{ to: "right start" }}
        transition
      >
        <div className="flex items-center mb-3">
          <div className="mr-auto text-body-md-str">Variations</div>
          <div className="mr-2 text-secondary">
            {activeIndex !== null ? activeIndex + 1 : 0} of {content.length}
          </div>
          <CloseButton className="btn-icon size-6">
            <Icon className="!size-4" name="close" />
          </CloseButton>
        </div>
        <div className="flex flex-wrap -mt-2 -mx-1">
          {content.map((item) => (
            <div
              className={`relative w-[calc(50%-0.5rem)] mx-1 mt-2 cursor-pointer after:absolute after:inset-0 after:rounded-xl after:shadow-[0_0_0_1.5px_var(--color-shade-06)_inset,0px_0px_0px_3px_var(--color-surface-01)_inset] after:opacity-0 after:transition-opacity hover:after:opacity-100 ${
                activeIndex === item.id ? "after:opacity-100" : ""
              }`}
              key={item.id}
              onClick={() => setActiveIndex(item.id)}
            >
              <Image
                className="w-full rounded-2xl"
                src={item.image}
                width={64}
                height={64}
                alt="Material"
              />
            </div>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  );
}

export default Variations;
