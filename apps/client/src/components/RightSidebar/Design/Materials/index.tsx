import { useState } from "react";
import Image from "@/components/Image";
import Group from "../../Group";

import { content } from "./content";

function Materials() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Group title="Materials">
      <div className="flex flex-wrap -mt-2 -mx-1">
        {content.map((item) => (
          <div
            className={`flex justify-center items-center aspect-square w-[calc(50%-0.5rem)] mx-1 mt-2 p-1.5 bg-surface-03 rounded-2xl cursor-pointer transition-shadow hover:shadow-[0_0_0_1.5px_var(--color-shade-06)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset] ${
              activeIndex === item.id
                ? "shadow-[0_0_0_1.5px_var(--color-shade-06)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset]"
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
