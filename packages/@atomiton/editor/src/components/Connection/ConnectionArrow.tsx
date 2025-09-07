import { styled } from "@atomiton/ui";
import type { ConnectionArrowProps } from "./Connection.types";

const ConnectionArrowStyled = styled("marker", {
  name: "ConnectionArrow",
})("atomiton-connection-arrow", {
  variants: {
    type: {
      arrow: "",
      arrowclosed: "",
      dot: "",
      none: "hidden",
    },
    position: {
      start: "",
      end: "",
    },
    size: {
      sm: "[&>*]:scale-75",
      md: "",
      lg: "[&>*]:scale-125",
    },
  },
  defaultVariants: {
    type: "arrow",
    position: "end",
    size: "md",
  },
});

/**
 * Connection arrow - arrowhead/marker
 */
export function ConnectionArrow({
  className,
  type = "arrow",
  arrowPosition = "end",
  size = "md",
  color,
  ...props
}: ConnectionArrowProps) {
  if (type === "none") return null;

  const arrowId = `arrow-${type}-${arrowPosition}-${Date.now()}`;

  return (
    <defs>
      <ConnectionArrowStyled
        id={arrowId}
        type={type}
        position={arrowPosition}
        size={size}
        className={className}
        viewBox="0 0 10 10"
        refX="9"
        refY="3"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
        data-type={type}
        data-position={arrowPosition}
        data-size={size}
        {...props}
      >
        {type === "arrow" && (
          <path d="M0,0 L0,6 L9,3 z" fill={color || "currentColor"} />
        )}
        {type === "arrowclosed" && (
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={color || "currentColor"}
            stroke={color || "currentColor"}
          />
        )}
        {type === "dot" && (
          <circle cx="5" cy="3" r="2" fill={color || "currentColor"} />
        )}
      </ConnectionArrowStyled>
    </defs>
  );
}
