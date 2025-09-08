import { useState } from "react";
import Icon from "@/components/Icon";
import { Icon as UIIcon } from "@atomiton/ui";
import Action from "./Action";

type Props = {
  item: {
    id: string;
    title: string;
    type: string;
    icon: string;
  };
  selected: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
};

function Item({ item, selected, onClick, onDelete }: Props) {
  const [lock, setLock] = useState(false);
  const [view, setView] = useState(false);

  return (
    <div className="group/item relative" key={item.id}>
      <button
        className={`group/button flex items-center gap-3 w-full p-0.75 border rounded-xl transition-colors group-hover/item:bg-surface-03 group-hover/item:pr-24 ${
          selected ? "bg-surface-03 border-s-02" : "border-transparent"
        } ${lock ? "pr-24" : ""} ${view ? "pr-16" : ""}`}
        onClick={onClick}
      >
        <div
          className={`flex justify-center items-center shrink-0 size-8 rounded-lg transition-all group-hover/item:bg-surface-01 ${
            selected
              ? "bg-surface-01 shadow-[0_0px_4px_0px_rgba(18,18,18,0.10)]"
              : "bg-surface-03"
          }`}
        >
          <UIIcon
            name={item.icon || "circle"}
            size={16}
            className="text-secondary"
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
        {onDelete && (
          <button
            className="opacity-0 transition-opacity outline-0 group-hover/item:opacity-100 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <Icon
              className="!size-4 fill-secondary transition-colors hover:fill-red-400"
              name="trash"
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default Item;
