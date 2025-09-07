import { styled } from "@atomiton/ui";
import type { PanelProps } from "./Panel.types";

/**
 * Generic panel component for flexible content areas.
 * Can be positioned on any side of the screen with configurable sizing.
 */
const PanelRootStyled = styled("div", {
  name: "PanelRoot",
})(
  [
    "atomiton-panel",
    "fixed",
    "z-10",
    "bg-surface-01",
    "border",
    "border-s-01",
    "rounded-[1.25rem]",
    "flex",
    "flex-col",
    "shadow-panel",
  ],
  {
    variants: {
      side: {
        top: "top-3 left-3 right-3",
        right: "top-3 bottom-3 right-3",
        bottom: "bottom-3 left-3 right-3",
        left: "top-3 bottom-3 left-3",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
      open: {
        true: "translate-x-0 translate-y-0",
        false: "",
      },
    },
    compoundVariants: [
      // Left side sizing
      {
        side: "left",
        size: "sm",
        class: "w-55",
      },
      {
        side: "left",
        size: "md",
        class: "w-60",
      },
      {
        side: "left",
        size: "lg",
        class: "w-64",
      },
      // Right side sizing
      {
        side: "right",
        size: "sm",
        class: "w-55",
      },
      {
        side: "right",
        size: "md",
        class: "w-60",
      },
      {
        side: "right",
        size: "lg",
        class: "w-64",
      },
      // Top/bottom sizing
      {
        side: "top",
        size: "sm",
        class: "h-48",
      },
      {
        side: "top",
        size: "md",
        class: "h-56",
      },
      {
        side: "top",
        size: "lg",
        class: "h-64",
      },
      {
        side: "bottom",
        size: "sm",
        class: "h-48",
      },
      {
        side: "bottom",
        size: "md",
        class: "h-56",
      },
      {
        side: "bottom",
        size: "lg",
        class: "h-64",
      },
      // Hide animations for mobile
      {
        side: "left",
        open: false,
        class: "max-[1023px]:-translate-x-full",
      },
      {
        side: "right",
        open: false,
        class: "max-[1023px]:translate-x-full",
      },
      {
        side: "top",
        open: false,
        class: "max-[1023px]:-translate-y-full",
      },
      {
        side: "bottom",
        open: false,
        class: "max-[1023px]:translate-y-full",
      },
    ],
    defaultVariants: {
      side: "left",
      size: "md",
      open: true,
    },
  },
);

export function PanelRoot({
  children,
  side = "left",
  size = "md",
  open = true,
  title,
  scrollable = false,
  onClose,
  ...props
}: PanelProps) {
  return (
    <PanelRootStyled
      side={side}
      size={size}
      open={open}
      data-side={side}
      data-size={size}
      data-open={open || undefined}
      data-scrollable={scrollable || undefined}
      role="region"
      aria-label={title}
      {...props}
    >
      {children}
    </PanelRootStyled>
  );
}
