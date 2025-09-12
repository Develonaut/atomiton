import { useState } from "react";
import Icon from "@/components/Icon";
import { RangeSlider } from "@/components/form";

function Isometric() {
  const [range, setRange] = useState(0.283);

  return (
    <div className="px-1">
      <div className="mb-2">Distortion</div>
      <div className="flex gap-1">
        <div className="grow relative">
          <RangeSlider
            value={range}
            onChange={setRange}
            min={0}
            max={1}
            step={0.001}
          />
        </div>
        <div className="flex justify-center items-center gap-1.5 shrink-0 w-19.5 h-9 pr-1 bg-surface-03 rounded-[0.625rem]">
          <Icon className="!size-4 fill-secondary/70" name="arrow-expand" />
          {range}
        </div>
      </div>
    </div>
  );
}

export default Isometric;
