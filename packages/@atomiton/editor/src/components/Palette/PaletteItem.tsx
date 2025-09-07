import { styled } from "@atomiton/ui";

const PaletteItemStyled = styled("div", {
  name: "PaletteItem",
})([
  "atomiton-palette-item",
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "p-3",
  "rounded",
  "border",
  "border-s-01",
  "bg-surface-01",
  "hover:bg-surface-02",
  "hover:border-accent-primary",
  "cursor-grab",
  "active:cursor-grabbing",
  "transition-all",
  "duration-200",
]);

interface PaletteItemProps {
  id: string;
  name: string;
  icon?: string;
  type: string;
  onDragStart?: () => void;
  onClick?: () => void;
  className?: string;
}

export function PaletteItem({
  id,
  name,
  icon,
  type,
  onDragStart,
  onClick,
  className,
  ...props
}: PaletteItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.();
  };

  return (
    <PaletteItemStyled
      className={className}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      data-item-id={id}
      data-item-type={type}
      {...props}
    >
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <div className="text-xs text-center">{name}</div>
    </PaletteItemStyled>
  );
}
