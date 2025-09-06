import { useState } from "react";
import AnimateHeight from "react-animate-height";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Button from "@/components/Button";

type Props = {
  className?: string;
  title: string;
  titleButton?: string;
  items: {
    id: number;
    title: string;
    category: string;
    image: string;
  }[];
  largeImage?: boolean;
};

function Accordion({
  className,
  title,
  titleButton,
  items,
  largeImage,
}: Props) {
  const [active, setActive] = useState(true);

  return (
    <div
      className={`relative border-t border-s-01 first:border-t-0 ${
        className || ""
      }`}
    >
      <button
        className="flex justify-between items-center w-full px-4 py-3 text-body-md-str outline-0"
        onClick={() => setActive(!active)}
      >
        {title}
        <div className="flex items-center justify-center shrink-0 size-6">
          <Icon
            className={`!size-4 fill-secondary transition-transform ${
              active ? "rotate-180" : ""
            }`}
            name="chevron"
          />
        </div>
      </button>
      <AnimateHeight duration={500} height={active ? "auto" : 0}>
        <div className="p-4 pt-0">
          <div className="flex flex-wrap -mt-2 -mx-1">
            {items.map((item) => (
              <Popover className="w-[calc(50%-0.5rem)] mx-1 mt-2" key={item.id}>
                <PopoverButton className="relative w-full aspect-square p-1.5 bg-surface-03 rounded-2xl cursor-pointer outline-0 after:absolute after:inset-0 after:shadow-[0_0_0_1.5px_rgba(123,123,123,0.5)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset] after:opacity-0 after:transition-opacity after:rounded-2xl hover:after:opacity-100 data-open:after:opacity-100">
                  <Image
                    className={`object-cover ${
                      largeImage ? "size-22" : "size-16"
                    }`}
                    src={item.image}
                    width={largeImage ? 88 : 64}
                    height={largeImage ? 88 : 64}
                    alt=""
                  />
                </PopoverButton>
                <PopoverPanel
                  className="absolute !top-1/2 !left-65 -translate-y-1/2 z-20 flex origin-top flex-col w-68 p-2 shadow-popover rounded-3xl bg-surface-01 transition duration-200 ease-out data-closed:opacity-0"
                  anchor="right start"
                  transition
                >
                  <div className="flex justify-center items-center h-48 mb-2 bg-surface-03 rounded-2xl">
                    <Image
                      className={`object-cover ${
                        largeImage ? "size-48" : "size-32"
                      }`}
                      src={item.image}
                      width={largeImage ? 192 : 128}
                      height={largeImage ? 192 : 128}
                      alt="3d object"
                    />
                  </div>
                  <div className="p-2">
                    <div className="mb-1 text-heading-str">{item.title}</div>
                    <div className="mb-4 text-secondary/80">
                      {item.category}
                    </div>
                    <div className="flex gap-2">
                      <button className="size-9 border border-s-02 rounded-[0.625rem] transition-colors hover:bg-s-02">
                        <Icon name="trash" />
                      </button>
                      <Button className="grow !h-9" isPrimary>
                        {titleButton || "Insert Object"}
                      </Button>
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>
            ))}
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
}

export default Accordion;
