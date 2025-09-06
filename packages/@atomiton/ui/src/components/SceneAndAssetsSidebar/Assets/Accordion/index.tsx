import { useState } from "react";
import Image from "@/components/Image";
import AnimateHeight from "react-animate-height";

type Props = {
  className?: string;
  title: string;
  items: {
    id: number;
    title: string;
    category: string;
    image: string;
  }[];
  largeImage?: boolean;
};

const Accordion = ({ className, title, items, largeImage }: Props) => {
  const [active, setActive] = useState(true);

  return (
    <div
      className={`relative border-t border-[#ECECEC] first:border-t-0 ${
        className || ""
      }`}
    >
      <button
        className="flex justify-between items-center w-full px-4 py-3 text-[0.75rem] font-semibold text-[#121212] cursor-pointer"
        onClick={() => setActive(!active)}
      >
        {title}
        <div className="flex items-center justify-center shrink-0 size-6">
          <svg
            className={`size-4 fill-[#7B7B7B] transition-transform ${
              active ? "rotate-180" : ""
            }`}
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M11.371 12.38c-.757.827-1.985.827-2.742 0l-3.36-3.668a1.07 1.07 0 0 1 0-1.418c.359-.392.94-.392 1.299 0l3.36 3.668c.04.044.104.044.144 0l3.36-3.668c.359-.392.94-.392 1.299 0a1.07 1.07 0 0 1 0 1.418l-3.36 3.668z" />
          </svg>
        </div>
      </button>
      <AnimateHeight duration={500} height={active ? "auto" : 0}>
        <div className="p-4 pt-0">
          <div className="flex flex-wrap -mt-2 -mx-1">
            {items.map((item) => (
              <button
                className="relative flex justify-center items-center w-[calc(50%-0.5rem)] mx-1 mt-2 aspect-square p-1.5 bg-[#F1F1F1] rounded-2xl cursor-pointer after:absolute after:inset-0 after:shadow-[0_0_0_1.5px_rgba(123,123,123,0.5)_inset,0px_0px_0px_4px_#fcfcfc_inset] after:opacity-0 after:transition-opacity after:rounded-2xl hover:after:opacity-100 data-open:after:opacity-100"
                key={item.id}
              >
                <Image
                  className={`object-cover ${
                    largeImage ? "size-22" : "size-16"
                  }`}
                  src={item.image}
                  width={largeImage ? 88 : 64}
                  height={largeImage ? 88 : 64}
                  alt=""
                />
              </button>
            ))}
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
};

export default Accordion;
