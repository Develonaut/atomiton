import Icon from "#components/Icon";
import { useEditorNode } from "@atomiton/editor";
import { useState } from "react";
import Action from "./Action";
import Variations from "./Variations";

type Props = {
  nodeId: string;
};

function Item({ nodeId }: Props) {
  const { node, isSelected, selectNode } = useEditorNode(nodeId);

  const [lock, setLock] = useState(false);
  const [view, setView] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  if (!node) return null;

  const metadata = node.metadata;
  const title = node.name || "Untitled";
  const type = metadata?.variant || node.type || "default";

  return (
    <div className="group/item relative" key={nodeId}>
      <button
        className={`group/button flex items-center gap-3 w-full p-0.75 border rounded-xl transition-colors group-hover/item:bg-surface-03 group-hover/item:pr-24 ${
          isSelected ? "bg-surface-03 border-s-02" : "border-transparent"
        } ${lock ? "pr-24" : ""} ${view ? "pr-16" : ""} ${
          sparkle ? "pr-10" : ""
        }`}
        onClick={selectNode}
      >
        <div
          className={`flex justify-center items-center shrink-0 size-8 rounded-lg transition-all group-hover/item:bg-surface-01 ${
            isSelected
              ? "bg-surface-01 shadow-[0_0px_4px_0px_rgba(18,18,18,0.10)]"
              : "bg-surface-03"
          }`}
        >
          <Icon
            className="!size-4"
            name={
              metadata?.icon ||
              (type === "code"
                ? "code-2"
                : type === "transform"
                  ? "wand-2"
                  : type === "csv-reader"
                    ? "table-2"
                    : type === "file-system"
                      ? "file"
                      : type === "http-request"
                        ? "globe-2"
                        : type === "image-composite"
                          ? "image"
                          : type === "loop"
                            ? "git-branch"
                            : type === "parallel"
                              ? "zap"
                              : type === "shell-command"
                                ? "terminal"
                                : "layers")
            }
          />
        </div>
        <span className="truncate text-left text-body-md text-primary">
          {title}
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
