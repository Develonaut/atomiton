import { useState } from "react";
import AnimateHeight from "react-animate-height";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Icon from "@/components/Icon";
import { Icon as UIIcon } from "@atomiton/ui";
import Button from "@/components/Button";
import { onDragStart } from "@atomiton/editor";

type Props = {
  className?: string;
  title: string;
  titleButton?: string;
  items: {
    id: number;
    nodeType?: string;
    title: string;
    category: string;
    icon?: string;
    description?: string;
  }[];
  largeImage?: boolean;
  onAddNode?: (nodeType: string) => void;
};

function Accordion({
  className,
  title,
  titleButton,
  items,
  largeImage,
  onAddNode,
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
              <Popover
                className="w-[calc(33.333%-0.5rem)] mx-1 mt-2"
                key={item.id}
              >
                <div
                  className="relative"
                  draggable={!!item.nodeType}
                  onDragStart={
                    item.nodeType ? onDragStart(item.nodeType) : undefined
                  }
                >
                  <PopoverButton className="relative w-full aspect-square p-1.5 bg-surface-03 rounded-2xl cursor-pointer outline-0 after:absolute after:inset-0 after:shadow-[0_0_0_1.5px_rgba(123,123,123,0.5)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset] after:opacity-0 after:transition-opacity after:rounded-2xl hover:after:opacity-100 data-open:after:opacity-100">
                    <div className="flex items-center justify-center w-full h-full">
                      <UIIcon
                        name={item.icon || "circle"}
                        size={28}
                        className="text-secondary"
                      />
                    </div>
                  </PopoverButton>
                </div>
                <PopoverPanel
                  className="absolute !top-1/2 !left-65 -translate-y-1/2 z-20 flex origin-top flex-col w-68 p-2 shadow-popover rounded-3xl bg-surface-01 transition duration-200 ease-out data-closed:opacity-0"
                  anchor="right start"
                  transition
                >
                  <div className="flex justify-center items-center h-48 mb-2 bg-surface-03 rounded-2xl">
                    <UIIcon
                      name={item.icon || "circle"}
                      size={largeImage ? 80 : 64}
                      className="text-primary"
                    />
                  </div>
                  <div className="p-2">
                    <div className="mb-1 text-heading-str">{item.title}</div>
                    <div className="mb-2 text-secondary/80">
                      {item.category}
                    </div>
                    {item.description && (
                      <div className="mb-4 text-sm text-secondary/60">
                        {item.description}
                      </div>
                    )}
                    <Button
                      className="w-full !h-9"
                      isPrimary
                      onClick={() => {
                        if (item.nodeType && onAddNode) {
                          onAddNode(item.nodeType);
                        }
                      }}
                    >
                      {titleButton || "Insert Object"}
                    </Button>
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
