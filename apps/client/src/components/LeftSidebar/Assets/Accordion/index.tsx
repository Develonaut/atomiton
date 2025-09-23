import Icon from "#components/Icon";
import { Icon as UIIcon } from "@atomiton/ui";
import { useState } from "react";
import AnimateHeight from "react-animate-height";

type Props = {
  className?: string;
  title: string;
  items: {
    id: number;
    nodeType?: string;
    title: string;
    category: string;
    icon?: string;
    description?: string;
  }[];
  onAddNode?: (nodeType: string) => void;
};

function Accordion({ className, title, items, onAddNode }: Props) {
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
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                className="w-full p-3 bg-surface-03 rounded-2xl cursor-pointer outline-0 transition-all hover:bg-surface-04 active:scale-[0.98]"
                onClick={() => {
                  if (item.nodeType && onAddNode) {
                    onAddNode(item.nodeType);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-12 bg-surface-01 rounded-xl shrink-0">
                    <UIIcon
                      name={item.icon || "circle"}
                      size={20}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <div className="text-body-md-str text-primary">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-body-sm text-secondary/70 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
}

export default Accordion;
