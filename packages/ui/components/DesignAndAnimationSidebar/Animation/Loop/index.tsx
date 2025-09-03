import { useState } from "react";
import Slider from "rc-slider";
import Image from "next/image";
import Tabs from "@/components/Tabs";
import Group from "../../Group";
import "rc-slider/assets/index.css";

const tabs = [
  { id: 0, name: "Short" },
  { id: 1, name: "Long" },
];

const Loop = () => {
  const [tab, setTab] = useState(tabs[0]);
  const [values, setValues] = useState([6, 14]);

  return (
    <Group
      title="Loop"
      rightContent={
        <button className="flex justify-center items-center size-6 shrink-0 rounded-md fill-[#7B7B7B] transition-colors cursor-pointer hover:bg-[#F1F1F1]">
          <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
            <path d="M3.5 5.756c0-2.979 3.306-4.768 5.8-3.14l6.512 4.251c2.267 1.48 2.267 4.801 0 6.28L9.3 17.398c-2.494 1.628-5.8-.161-5.8-3.14V5.756zm4.98-1.884C6.983 2.895 5 3.969 5 5.756v8.501c0 1.787 1.983 2.861 3.48 1.884l6.512-4.251a2.25 2.25 0 0 0 0-3.768L8.48 3.872z" />
          </svg>
        </button>
      }
    >
      <div className="relative mb-2 border border-[#ececec] rounded-xl overflow-hidden">
        <Image
          className="w-full h-15 object-cover opacity-100"
          src="/images/loop.png"
          width={208}
          height={60}
          alt="Loop"
        />
        <Slider
          className="range-loop !absolute top-0 left-0 !w-full !h-full !p-0 z-2 cursor-pointer"
          range
          value={values}
          onChange={(value) => setValues(value as number[])}
          min={0}
          max={20}
          step={1}
          styles={{
            handle: {
              width: "2px",
              height: "100%",
              backgroundColor: "#fcfcfc",
              border: "none",
              borderRadius: "0",
              outline: "none",
              cursor: "pointer",
              marginTop: "0",
              boxShadow: "none",
            },
            track: {
              height: "100%",
              backgroundColor: "rgba(18, 18, 18, 0.35)",
              borderRadius: "0",
            },
            rail: {
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: "0",
            },
          }}
        />
      </div>
      <div className="flex gap-1.5">
        <Tabs
          className="grow"
          items={tabs}
          value={tab}
          setValue={setTab}
          isMedium
        />
        <div className="flex justify-center items-center gap-1.5 shrink-0 w-14 h-9 pr-1 bg-[#f1f1f1] rounded-[0.625rem] text-[0.75rem] font-medium">
          <svg
            className="size-4 fill-[#7b7b7b]/70"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M10 1.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 1 1 0-17zm0 1.843A6.66 6.66 0 0 0 3.343 10 6.66 6.66 0 0 0 10 16.657 6.66 6.66 0 0 0 16.657 10 6.66 6.66 0 0 0 10 3.343zm0 2.253a.92.92 0 0 1 .922.922l-.001 3.099 1.984 1.984a.92.92 0 0 1 .089 1.2l-.089.103a.92.92 0 0 1-1.303 0l-2.253-2.253a.92.92 0 0 1-.27-.652V6.518A.92.92 0 0 1 10 5.596z" />
          </svg>
          {values[1] - values[0]}s
        </div>
      </div>
    </Group>
  );
};

export default Loop;
