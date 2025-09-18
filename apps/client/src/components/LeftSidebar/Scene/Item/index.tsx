import Icon from "@/components/Icon";
import { useState } from "react";
import Action from "./Action";
import Variations from "./Variations";

type Props = {
  item: {
    id: number;
    title: string;
    type: string;
  };
  selected: number;
  onClick: () => void;
};

function Item({ item, selected, onClick }: Props) {
  const [lock, setLock] = useState(false);
  const [view, setView] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  console.log({ item });

  return (
    <div className="group/item relative" key={item.id}>
      <button
        className={`group/button flex items-center gap-3 w-full p-0.75 border rounded-xl transition-colors group-hover/item:bg-surface-03 group-hover/item:pr-24 ${
          selected === item.id
            ? "bg-surface-03 border-s-02"
            : "border-transparent"
        } ${lock ? "pr-24" : ""} ${view ? "pr-16" : ""} ${
          sparkle ? "pr-10" : ""
        }`}
        onClick={onClick}
      >
        <div
          className={`flex justify-center items-center shrink-0 size-8 rounded-lg transition-all group-hover/item:bg-surface-01 ${
            selected === item.id
              ? "bg-surface-01 shadow-[0_0px_4px_0px_rgba(18,18,18,0.10)]"
              : "bg-surface-03"
          }`}
        >
          <Icon
            className="!size-4"
            name={
              item.type === "camera"
                ? "camera"
                : item.type === "dome-light"
                  ? "sun"
                  : item.type === "key-light"
                    ? "bulb"
                    : item.type === "area-light"
                      ? "solar"
                      : "cube"
            }
          />
        </div>
        <span className="truncate text-left text-body-md text-primary">
          {item.title}
        </span>
      </button>
      <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-3">
        <Action
          icon="unlock"
          iconActive="lock"
          active={lock}
          onClick={() => setLock(!lock)}
        />
        <Action
          icon="show-view"
          iconActive="hide-view"
          active={view}
          onClick={() => setView(!view)}
        />
        <Variations onClick={() => setSparkle(!sparkle)} />
      </div>
    </div>
  );
}

export default Item;
