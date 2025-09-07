import { styled } from "@atomiton/ui";
import type { ToolbarProps } from "./Toolbar.types";

const ToolbarRootStyled = styled("div", {
  name: "ToolbarRoot",
})(
  [
    "atomiton-toolbar",
    "fixed",
    "z-20",
    "flex",
    "items-center",
    "gap-1",
    "shadow-toolbar",
    "border",
    "border-s-01",
    "bg-surface-01",
    "rounded-[1.25rem]",
  ],
  {
    variants: {
      position: {
        left: "left-3",
        center: "left-1/2 -translate-x-1/2",
        right: "right-3",
      },
      verticalPosition: {
        top: "top-3",
        bottom: "bottom-3",
      },
      size: {
        sm: "h-10 px-2",
        md: "h-12 px-3",
        lg: "h-14 px-4",
      },
    },
    defaultVariants: {
      position: "center",
      verticalPosition: "top",
      size: "md",
    },
  },
);

/**
 * Composable toolbar component for editor layouts.
 * Provides flexible positioning and content slots.
 */
export function ToolbarRoot({
  children,
  horizontalPosition = "center",
  verticalPosition = "top",
  size = "md",
  title,
  ...props
}: ToolbarProps) {
  return (
    <ToolbarRootStyled
      position={horizontalPosition}
      verticalPosition={verticalPosition}
      size={size}
      data-position={horizontalPosition}
      data-vertical-position={verticalPosition}
      data-size={size}
      role="toolbar"
      aria-label={title || "Editor toolbar"}
      {...props}
    >
      {children}
    </ToolbarRootStyled>
  );
}
