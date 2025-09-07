import { Handle, Position } from "@xyflow/react";
import { styled } from "@atomiton/ui";
import type { ElementPortProps } from "./Element.types";

const ElementPortStyled = styled(Handle, {
  name: "ElementPort",
})(
  [
    "atomiton-element-port",
    "w-3",
    "h-3",
    "rounded-full",
    "border-2",
    "transition-all",
    "duration-200",
  ],
  {
    variants: {
      type: {
        input: "border-accent-secondary bg-surface-01",
        output: "border-accent-primary bg-surface-01",
      },
      position: {
        top: "",
        right: "",
        bottom: "",
        left: "",
      },
      connected: {
        true: "bg-accent-primary border-accent-primary scale-110",
        false: "hover:scale-125",
      },
      required: {
        true: "ring-2 ring-status-warning/30",
        false: "",
      },
    },
    compoundVariants: [
      {
        type: "input",
        connected: true,
        class: "bg-accent-secondary border-accent-secondary",
      },
    ],
    defaultVariants: {
      type: "input",
      position: "left",
      connected: false,
      required: false,
    },
  },
);

/**
 * Element port - individual connection point
 */
export function ElementPort({
  className,
  id,
  type,
  portPosition,
  label,
  connected = false,
  dataType,
  required = false,
  onConnect,
  onDisconnect,
  ...props
}: ElementPortProps) {
  // Map our position type to React Flow Position enum
  const handlePosition = {
    top: Position.Top,
    right: Position.Right,
    bottom: Position.Bottom,
    left: Position.Left,
  }[portPosition];

  const handleStyle = {};

  return (
    <>
      <ElementPortStyled
        id={id}
        type={type === "input" ? "target" : "source"}
        position={handlePosition}
        portType={type}
        portPosition={portPosition}
        connected={connected}
        required={required}
        className={className}
        style={handleStyle}
        data-port-id={id}
        data-port-type={type}
        data-data-type={dataType}
        data-required={required || undefined}
        data-connected={connected || undefined}
        onConnect={(_connection) => onConnect?.(id)}
        {...props}
      />
      {label && (
        <div
          className="absolute text-xs text-text-secondary whitespace-nowrap pointer-events-none"
          style={{
            [portPosition]: "-24px",
            ...(portPosition === "top" || portPosition === "bottom"
              ? { left: "50%", transform: "translateX(-50%)" }
              : { top: "50%", transform: "translateY(-50%)" }),
          }}
        >
          {label}
        </div>
      )}
    </>
  );
}
