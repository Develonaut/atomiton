import { styled } from "@atomiton/ui";
import type { ToolbarButtonProps } from "./Toolbar.types";

const ToolbarButtonStyled = styled("button", {
  name: "ToolbarButton",
})(
  [
    "atomiton-toolbar-button",
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-lg",
    "font-medium",
    "transition-all",
    "duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-accent-primary",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-sm gap-1",
        md: "h-9 px-3 text-sm gap-2",
        lg: "h-10 px-4 text-base gap-2",
      },
      variant: {
        ghost:
          "hover:bg-surface-02 text-text-secondary hover:text-text-primary",
        filled:
          "bg-accent-primary text-text-on-accent hover:bg-accent-primary-hover",
        outline: "border border-s-01 hover:bg-surface-02 text-text-primary",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "ghost",
        active: true,
        class: "bg-surface-02 text-text-primary",
      },
      {
        variant: "outline",
        active: true,
        class: "bg-accent-primary text-text-on-accent border-accent-primary",
      },
    ],
    defaultVariants: {
      size: "md",
      variant: "ghost",
      active: false,
    },
  },
);

/**
 * Toolbar button component
 */
export function ToolbarButton({
  children,
  icon,
  tooltip,
  size = "md",
  variant = "ghost",
  active = false,
  disabled = false,
  onClick,
  type = "button",
  ...props
}: ToolbarButtonProps) {
  return (
    <ToolbarButtonStyled
      type={type}
      size={size}
      variant={variant}
      active={active}
      disabled={disabled}
      onClick={onClick}
      title={tooltip}
      data-variant={variant}
      data-size={size}
      data-active={active || undefined}
      aria-pressed={active}
      {...props}
    >
      {icon && <span className="toolbar-button-icon">{icon}</span>}
      {children && <span className="toolbar-button-text">{children}</span>}
    </ToolbarButtonStyled>
  );
}
