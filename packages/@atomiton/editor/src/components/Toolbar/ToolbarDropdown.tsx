import { styled } from "@atomiton/ui";
import { useState } from "react";
import type { ToolbarDropdownProps } from "./Toolbar.types";

const ToolbarDropdownStyled = styled("div", {
  name: "ToolbarDropdown",
})("relative");

const ToolbarDropdownTriggerStyled = styled("button", {
  name: "ToolbarDropdownTrigger",
})(
  [
    "flex",
    "items-center",
    "justify-between",
    "gap-1",
    "rounded",
    "border",
    "border-s-01",
    "bg-surface-01",
    "font-medium",
    "transition-all",
    "duration-200",
    "hover:bg-surface-02",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "h-6 px-2 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const ToolbarDropdownMenuStyled = styled("div", {
  name: "ToolbarDropdownMenu",
})([
  "absolute",
  "top-full",
  "left-0",
  "mt-1",
  "min-w-[200px]",
  "bg-surface-01",
  "border",
  "border-s-01",
  "rounded-lg",
  "shadow-dropdown",
  "z-30",
]);

/**
 * Toolbar dropdown component
 * TODO: Implement proper dropdown using @atomiton/ui Popover once available
 */
export function ToolbarDropdown({
  children,
  className,
  trigger,
  size = "md",
  disabled = false,
  side = "bottom",
  align = "center",
  ...props
}: ToolbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ToolbarDropdownStyled className={className} {...props}>
      <ToolbarDropdownTriggerStyled
        size={size}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        data-state={isOpen ? "open" : "closed"}
        data-side={side}
        data-align={align}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {/* TODO: Replace with proper chevron icon from @atomiton/ui */}
        <span className="ml-1">▼</span>
      </ToolbarDropdownTriggerStyled>

      {/* TODO: Replace with proper Popover/Dropdown component */}
      {isOpen && (
        <ToolbarDropdownMenuStyled role="menu">
          {children}
        </ToolbarDropdownMenuStyled>
      )}
    </ToolbarDropdownStyled>
  );
}
