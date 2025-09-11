export type ButtonBaseProps = {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  // Align with shadcn API
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "embossed";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;

  // Legacy props for backward compatibility
  isPrimary?: boolean;
  isSecondary?: boolean;
  isOrange?: boolean;
  isSmall?: boolean;
  isLarge?: boolean;
};

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
