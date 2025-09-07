import { styled } from "@atomiton/ui";
import type { ConnectionPathProps } from "./Connection.types";

const ConnectionPathStyled = styled("path", {
  name: "ConnectionPath",
})(
  [
    "atomiton-connection-path",
    "fill-none",
    "stroke-current",
    "transition-all",
    "duration-200",
  ],
  {
    variants: {
      type: {
        default: "stroke-s-02",
        straight: "stroke-s-02",
        step: "stroke-s-02",
        smoothstep: "stroke-s-02",
        bezier: "stroke-s-02",
      },
      state: {
        idle: "opacity-60 hover:opacity-100",
        active: "opacity-100 stroke-accent-primary",
        selected: "opacity-100 stroke-accent-primary stroke-[3]",
        error: "opacity-100 stroke-status-error",
        disabled: "opacity-30 pointer-events-none",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    compoundVariants: [
      {
        state: "active",
        animated: true,
        class: "animate-flow",
      },
    ],
    defaultVariants: {
      type: "default",
      state: "idle",
      animated: false,
    },
  },
);

/**
 * Connection path - SVG path element
 */
export function ConnectionPath({
  className,
  path,
  type = "default",
  state = "idle",
  selected = false,
  animated = false,
  style,
  strokeWidth = 2,
  strokeColor,
  ...props
}: ConnectionPathProps) {
  return (
    <ConnectionPathStyled
      type={type}
      state={selected ? "selected" : state}
      animated={animated}
      className={className}
      d={path}
      style={{
        strokeWidth,
        stroke: strokeColor,
        ...style,
      }}
      data-type={type}
      data-state={state}
      data-selected={selected || undefined}
      data-animated={animated || undefined}
      {...props}
    />
  );
}
