import { useState } from "react";
import { EdgeLabelRenderer } from "@xyflow/react";
import { styled } from "@atomiton/ui";
import type { ConnectionLabelProps } from "./Connection.types";

const ConnectionLabelStyled = styled("div", {
  name: "ConnectionLabel",
})(
  [
    "atomiton-connection-label",
    "absolute",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "rounded",
    "pointer-events-auto",
    "transition-all",
    "duration-200",
  ],
  {
    variants: {
      background: {
        solid: "bg-surface-01 border border-s-01 shadow-sm",
        transparent: "bg-transparent",
        blur: "bg-surface-01/80 backdrop-blur-sm border border-s-01/50",
      },
      editable: {
        true: "cursor-text hover:bg-surface-02",
        false: "cursor-default",
      },
    },
    defaultVariants: {
      background: "solid",
      editable: false,
    },
  },
);

/**
 * Connection label - optional text label on the connection
 */
export function ConnectionLabel({
  children,
  className,
  labelPosition = 0.5,
  background = "solid",
  editable = false,
  onEdit,
  ...props
}: ConnectionLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleOnEdit = () => {
    if (editable) {
      setEditValue(typeof children === "string" ? children : "");
      setIsEditing(true);
    }
  };

  const handleOnSave = () => {
    onEdit?.(editValue);
    setIsEditing(false);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleOnSave();
    } else if (event.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <EdgeLabelRenderer>
      <ConnectionLabelStyled
        background={background}
        editable={editable}
        className={className}
        style={{
          transform: `translate(-50%, -50%) translate(${labelPosition * 100}%, ${labelPosition * 100}%)`,
        }}
        data-position={labelPosition}
        data-background={background}
        data-editable={editable || undefined}
        onClick={handleOnEdit}
        {...props}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleOnSave}
            onKeyDown={handleOnKeyDown}
            className="bg-transparent outline-none w-full"
            autoFocus
          />
        ) : (
          children
        )}
      </ConnectionLabelStyled>
    </EdgeLabelRenderer>
  );
}
