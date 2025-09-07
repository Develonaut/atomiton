export interface ButtonBaseProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";

  // Legacy props for backward compatibility
  isPrimary?: boolean;
  isSecondary?: boolean;
  isOrange?: boolean;
  isSmall?: boolean;
  isLarge?: boolean;
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
} & ButtonBaseProps;

// Combined Button props type
export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;
