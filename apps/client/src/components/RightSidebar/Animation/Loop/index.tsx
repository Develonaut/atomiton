import { useState } from "react";
import Icon from "#components/Icon";
import Tabs from "#components/Tabs";
import Image from "#components/Image";
import Group from "./../Group";
import { DualRangeSlider } from "#components/form";

const tabs = [
  { id: 0, name: "Short" },
  { id: 1, name: "Long" },
];

function Loop() {
  const [tab, setTab] = useState(tabs[0]);
  const [values, setValues] = useState([6, 14]);

  return (
    <Group
      title="Loop"
      rightContent={
        <button className="btn-icon size-6">
          <Icon className="!size-4" name="play" />
        </button>
      }
    >
      <div className="relative mb-2 border border-s-01 rounded-xl overflow-hidden">
        <Image
          className="w-full h-15 object-cover opacity-100"
          src="/images/loop.png"
          width={208}
          height={60}
          alt="Loop"
        />
        <DualRangeSlider
          values={values as [number, number]}
          onChange={setValues}
          min={0}
          max={20}
          step={1}
          overlayStyle="timeline"
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
        <div className="flex justify-center items-center gap-1.5 shrink-0 w-14 h-9 pr-1 bg-surface-03 rounded-[0.625rem]">
          <Icon className="!size-4 fill-secondary/70" name="clock" />{" "}
          {values[1] - values[0]}s
        </div>
      </div>
    </Group>
  );
}

export default Loop;
