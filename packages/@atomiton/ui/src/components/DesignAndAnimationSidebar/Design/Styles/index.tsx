import Group from "#components/Group";
import Image from "#components/Image";
import { useState } from "react";

import { content } from "./content";

function Styles() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Group title="Styles">
      <div className="flex flex-wrap -mt-2 -mx-1">
        {content.map((item) => (
          <div
            className={`relative w-[calc(50%-0.5rem)] mx-1 mt-2 rounded-2xl overflow-hidden cursor-pointer after:absolute after:inset-0 after:shadow-[0_0_0_1.5px_#7b7b7b_inset,0px_0px_0px_3px_#fcfcfc_inset] after:opacity-0 after:transition-opacity after:rounded-2xl hover:after:opacity-100 ${
              activeIndex === item.id ? "after:opacity-100" : ""
            }`}
            key={item.id}
            onClick={() => setActiveIndex(item.id)}
          >
            <Image
              className="w-full h-auto"
              src={item.image}
              width={100}
              height={100}
              alt="Style Design"
            />
          </div>
        ))}
      </div>
    </Group>
  );
}

export default Styles;
