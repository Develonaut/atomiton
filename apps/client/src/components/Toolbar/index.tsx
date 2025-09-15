import Export from "@/components/Export";
import Icon from "@/components/Icon";
import Zoom from "@/components/Zoom";
import { useUndoRedo } from "@atomiton/editor";
import { Box, Button } from "@atomiton/ui";
import { useState } from "react";

type ToolbarProps = {
  // Will be called to save the current blueprint.
  // TODO: Non-functional placeholder until we implement actual saving.
  onSave: () => void;
};

function Toolbar({ onSave }: ToolbarProps) {
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const [active, setActive] = useState<number | null>(0);

  const actions = [
    {
      id: 0,
      icon: "cursor",
      onClick: () => {},
    },
    {
      id: 1,
      icon: "pinch",
      onClick: () => {},
    },
    {
      id: 2,
      icon: "message",
      onClick: () => {},
    },
    {
      id: 3,
      icon: "crop",
      onClick: () => {},
    },
    {
      id: 4,
      icon: "play",
      onClick: () => {},
    },
  ];

  return (
    <Box
      className="fixed top-3 left-1/2 z-20 -translate-x-1/2 flex shadow-toolbar border border-s-01 bg-surface-01 rounded-[1.25rem]"
      data-testid="toolbar"
    >
      <Box className="flex gap-2 p-2">
        {actions.map((action) => (
          <Button
            size="icon"
            variant={active === action.id ? "embossed" : "ghost"}
            key={action.id}
            onClick={() => {
              setActive(action.id);
              action.onClick();
            }}
          >
            <Icon className="fill-primary" name={action.icon} />
          </Button>
        ))}
        <Zoom />
        <Button
          size="icon"
          variant="ghost"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
        >
          <Icon className="fill-primary rotate-180" name="arrow" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
        >
          <Icon className="fill-primary" name="arrow" />
        </Button>
      </Box>
      <Box className="p-2">
        <Export />
      </Box>
    </Box>
  );
}

export default Toolbar;
