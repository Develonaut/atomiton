import type { VariantProps } from "class-variance-authority";
import type { buttonStyles } from "./Button.styles";
import type { LinkProps } from "@/components/Link";
import type { SystemProps } from "@/system";

export interface ButtonBaseProps
  extends VariantProps<typeof buttonStyles>,
    SystemProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;

  // Legacy props for backward compatibility
  isPrimary?: boolean;
  isSecondary?: boolean;
  isOrange?: boolean;
  isSmall?: boolean;
}

// Button as a regular button element
export type ButtonAsButton = {
  as?: "button";
} & ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

// Button as an anchor element
export type ButtonAsAnchor = {
  as: "a";
} & ButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

// Button as a Link component
export type ButtonAsLink = {
  as: "link";
  href?: string;
  to?: string;
} & ButtonBaseProps &
  Omit<LinkProps, "href" | "to">;

// Combined Button props type
export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;
