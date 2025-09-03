import { useState } from "react";

const Compression = () => {
  const [range, setRange] = useState(80);

  return (
    <div className="p-4 border-t border-[#ECECEC]">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[0.75rem] leading-[1rem] font-medium">
          Compression
        </div>
        <div className="text-[0.625rem] leading-[0.875rem] font-medium text-[#7B7B7B]/80">
          3840px × 2160px
        </div>
      </div>
      <div className="flex gap-1.5">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={range}
          onChange={(e) => setRange(parseFloat(e.target.value))}
          className="w-full h-9 appearance-none bg-[#f1f1f1] rounded-lg cursor-pointer range-slider"
          style={{
            background: `linear-gradient(to right, rgba(123, 123, 123, 0.3) 0%, rgba(123, 123, 123, 0.3) ${
              range / 1
            }%, #f1f1f1 ${range / 1}%, #f1f1f1 100%)`,
          }}
        />
        <div className="flex justify-center items-center gap-1.5 shrink-0 w-18 h-9 pr-1 border border-[#e2e2e2] rounded-[0.625rem] text-[0.75rem] leading-[1rem] font-medium">
          <svg
            className="shrink-0 size-4 fill-[#7b7b7b]/70"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M11.858 5.789a.92.92 0 0 1 1.341 0l2.776 2.891c.699.729.699 1.91 0 2.639L13.2 14.211a.92.92 0 0 1-1.341 0 1.02 1.02 0 0 1 0-1.397l2.701-2.815-2.701-2.813a1.02 1.02 0 0 1-.092-1.286l.092-.111zm-5.058 0a.92.92 0 0 1 1.341 0 1.02 1.02 0 0 1 0 1.397L5.44 9.999l2.702 2.815a1.02 1.02 0 0 1 .092 1.286l-.092.111a.92.92 0 0 1-1.341 0l-2.776-2.891c-.7-.729-.7-1.91 0-2.639L6.8 5.789z" />
          </svg>
          {range}%
        </div>
      </div>
    </div>
  );
};

export default Compression;
