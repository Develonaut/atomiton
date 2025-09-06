import { useState } from "react";

type Props = {
  className?: string;
};

function ColorPicker({ className }: Props) {
  const [color, setColor] = useState("F4F4F4");
  const [percentage, setPercentage] = useState("100");

  return (
    <div
      className={`flex items-center p-1 bg-[#F1F1F1] border border-[#ECECEC] rounded-[0.625rem] transition-colors hover:bg-[#F8F7F7] hover:border-[#E2E2E2] ${
        className || ""
      }`}
    >
      <div className="shrink-0 size-7 mr-3 bg-[#FCFCFC] rounded-md border border-[#323232]/10"></div>
      <input
        className="w-full h-auto text-[0.75rem] leading-[1rem] font-medium outline-0"
        type="text"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <div className="flex justify-center gap-2 shrink-0 w-16 px-3 ml-auto border-l border-[#323232]/10">
        <input
          className="w-full h-auto grow text-[0.75rem] leading-[1rem] font-medium outline-0"
          type="text"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
        />
        <div className="text-[0.75rem] leading-[1rem] font-medium">%</div>
      </div>
    </div>
  );
}

export default ColorPicker;
