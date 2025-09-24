import Group from "#components/Group";
import Image from "#components/Image";
import { useState } from "react";

import { content } from "#components/DesignAndAnimationSidebar/Design/Materials/content";

function Materials() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Group title="Materials">
      <div className="flex flex-wrap -mt-2 -mx-1">
        {content.map((item) => (
          <div
            className={`flex justify-center items-center aspect-square w-[calc(50%-0.5rem)] mx-1 mt-2 p-1.5 bg-[#F1F1F1] rounded-2xl cursor-pointer transition-shadow hover:shadow-[0_0_0_1.5px_#7b7b7b_inset,0px_0px_0px_4px_#fcfcfc_inset] ${
              activeIndex === item.id
                ? "shadow-[0_0_0_1.5px_#7b7b7b_inset,0px_0px_0px_4px_#fcfcfc_inset]"
                : ""
            }`}
            key={item.id}
            onClick={() => setActiveIndex(item.id)}
          >
            <Image src={item.image} width={64} height={64} alt="Material" />
          </div>
        ))}
      </div>
    </Group>
  );
}

export default Materials;
