import { useState } from "react";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Share from "./Share";
import ZoomIn from "./ZoomIn";

type ItemProps = {
  id: number;
  image: string;
};

type Props = {
  item: ItemProps;
  items: ItemProps[];
};

function Item({ item, items }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group relative w-[calc(20%-0.75rem)] mt-3 mx-1.5 p-6 bg-surface-02 border border-s-01 rounded-[1.25rem] overflow-hidden transition-colors hover:bg-surface-03 max-4xl:w-[calc(25%-0.75rem)] max-lg:w-[calc(33.333%-0.75rem)] max-md:w-[calc(50%-0.75rem)]">
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Image
            className="w-full"
            src={item.image}
            width={224}
            height={224}
            alt=""
          />
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-[#171717]/100 to-[#171717]/0 opacity-0 transition-opacity pointer-events-none group-hover:opacity-30"></div>
        <button className="absolute top-2 right-2 z-2 size-10 bg-surface-01 border border-[#DBDBDB] rounded-xl shadow-depth-01 opacity-0 transition-all group-hover:opacity-100 hover:bg-surface-02">
          <Icon className="!size-4" name="plus-think" />
        </button>
        <button className="absolute left-2 bottom-2 z-2 size-10 opacity-0 border border-transparent rounded-xl transition-colors hover:bg-shade-01/15 hover:border-shade-01/25 group-hover:opacity-100">
          <Icon className="!size-4 fill-shade-01" name="download" />
        </button>
        <Share image={item.image} buttonWithText />
        <ZoomIn
          open={open}
          onClose={() => setOpen(false)}
          items={items}
          activeId={item.id}
        />
      </div>
    </>
  );
}

export default Item;
