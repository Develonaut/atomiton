import { EdgeLabelRenderer } from "@xyflow/react";
import { styled } from "@atomiton/ui";
import type { ConnectionHandleProps } from "./Connection.types";

const ConnectionHandleStyled = styled("div", {
  name: "ConnectionHandle",
})(
  [
    "atomiton-connection-handle",
    "absolute",
    "w-6",
    "h-6",
    "flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "bg-surface-01",
    "border",
    "border-s-01",
    "cursor-pointer",
    "transition-all",
    "duration-200",
    "hover:scale-110",
    "hover:bg-surface-02",
    "pointer-events-auto",
  ],
  {
    variants: {
      type: {
        move: "cursor-move",
        split: "cursor-crosshair hover:bg-accent-secondary/20",
        delete:
          "cursor-pointer hover:bg-status-error/20 hover:border-status-error",
      },
      visible: {
        true: "opacity-100",
        false: "opacity-0 pointer-events-none",
      },
    },
    defaultVariants: {
      type: "move",
      visible: false,
    },
  },
);

/**
 * Connection handle - drag handle for editing connections
 */
export function ConnectionHandle({
  className,
  handlePosition = 0.5,
  type = "move",
  visible = false,
  onAction,
  ...props
}: ConnectionHandleProps) {
  const handleOnClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onAction?.(type);
  };

  return (
    <EdgeLabelRenderer>
      <ConnectionHandleStyled
        type={type}
        visible={visible}
        className={className}
        style={{
          transform: `translate(-50%, -50%) translate(${handlePosition * 100}%, ${handlePosition * 100}%)`,
        }}
        data-position={handlePosition}
        data-type={type}
        data-visible={visible || undefined}
        onClick={handleOnClick}
        {...props}
      >
        {type === "move" && <span className="text-xs">⋮⋮</span>}
        {type === "split" && <span className="text-xs">✂</span>}
        {type === "delete" && <span className="text-xs">×</span>}
      </ConnectionHandleStyled>
    </EdgeLabelRenderer>
  );
}
