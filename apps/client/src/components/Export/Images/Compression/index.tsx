import { useState } from "react";
import Icon from "@/components/Icon";

function Compression() {
  const [range, setRange] = useState(80);

  return (
    <div className="p-4 border-t border-s-01">
      <div className="flex justify-between items-center mb-2">
        <div className="text-body-sm">Compression</div>
        <div className="text-[0.625rem] text-secondary/80">3840px × 2160px</div>
      </div>
      <div className="flex gap-1.5">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={range}
          onChange={(e) => setRange(parseFloat(e.target.value))}
          className="w-full h-9 appearance-none bg-shade-03 rounded-lg cursor-pointer range-slider"
          style={{
            background: `linear-gradient(to right, var(--shade-06_30) 0%, var(--shade-06_30) ${
              range / 1
            }%, var(--shade-03) ${range / 1}%, var(--shade-03) 100%)`,
          }}
        />
        <div className="flex justify-center items-center gap-1.5 shrink-0 w-18 h-9 pr-1 border border-s-02 rounded-[0.625rem]">
          <Icon className="!size-4 fill-secondary/70" name="arrows" /> {range}%
        </div>
      </div>
    </div>
  );
}

export default Compression;
