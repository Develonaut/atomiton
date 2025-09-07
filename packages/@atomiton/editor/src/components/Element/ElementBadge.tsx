import { styled } from "@atomiton/ui";
import type { ElementBadgeProps } from "./Element.types";

const ElementBadgeStyled = styled("div", {
  name: "ElementBadge",
})(
  [
    "atomiton-element-badge",
    "absolute",
    "flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "font-medium",
  ],
  {
    variants: {
      variant: {
        status: "bg-status-success text-white",
        error: "bg-status-error text-white",
        warning: "bg-status-warning text-black",
        info: "bg-status-info text-white",
        count: "bg-accent-primary text-white",
      },
      position: {
        "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
        "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
        "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
        "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
      },
      size: {
        sm: "w-4 h-4 text-xs",
        md: "w-5 h-5 text-xs",
        lg: "w-6 h-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "status",
      position: "top-right",
      size: "md",
    },
  },
);

/**
 * Element badge - status indicator
 */
export function ElementBadge({
  children,
  className,
  variant = "status",
  badgePosition = "top-right",
  size = "md",
  ...props
}: ElementBadgeProps) {
  return (
    <ElementBadgeStyled
      variant={variant}
      position={badgePosition}
      size={size}
      className={className}
      data-variant={variant}
      data-position={badgePosition}
      data-size={size}
      {...props}
    >
      {children}
    </ElementBadgeStyled>
  );
}
