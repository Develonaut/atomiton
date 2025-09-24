import Image from "#components/Image";
import { useState } from "react";

import { content } from "#content";

function Variations() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="w-52 p-4 pt-3 bg-[#FCFCFC]/95 rounded-[1.25rem] shadow-2xl">
      <div className="flex items-center mb-3">
        <div className="mr-auto text-[0.75rem] leading-[1rem] font-semibold">
          Variations
        </div>
        <div className="mr-2 text-[0.75rem] leading-[1.125rem] text-[#7B7B7B]">
          {activeIndex !== null ? activeIndex + 1 : 0} of {content.length}
        </div>
        <button className="flex items-center justify-center rounded-md cursor-pointer size-6 transition-colors hover:bg-[#F1F1F1]">
          <svg
            className="size-4 fill-[#7B7B7B]"
            width={16}
            height={16}
            viewBox="0 0 16 16"
          >
            <path d="M4.63 4.63a.75.75 0 0 1 1.061 0l2.303 2.303 2.303-2.303a.75.75 0 0 1 .977-.073l.084.073a.75.75 0 0 1 0 1.061L9.054 7.993l2.303 2.303a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0L7.993 9.054 5.69 11.357a.75.75 0 0 1-.977.073l-.084-.073a.75.75 0 0 1 0-1.061l2.303-2.303L4.63 5.69a.75.75 0 0 1-.073-.977l.073-.084z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap -mt-2 -mx-1">
        {content.map((item) => (
          <div
            className={`relative w-[calc(50%-0.5rem)] mx-1 mt-2 cursor-pointer after:absolute after:inset-0 after:rounded-xl after:shadow-[0_0_0_1.5px_#7b7b7b_inset,0px_0px_0px_3px_#fcfcfc_inset] after:opacity-0 after:transition-opacity hover:after:opacity-100 ${
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
    </div>
  );
}

export default Variations;
