import React from "react";
import Link, { LinkProps } from "next/link";
import Icon from "@/components/Icon";

type CommonProps = {
  className?: string;
  icon?: string;
  children?: React.ReactNode;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isRed?: boolean;
};

type ButtonAsButton = {
  as?: "button";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsAnchor = {
  as: "a";
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonAsLink = {
  as: "link";
} & LinkProps;

type ButtonProps = CommonProps &
  (ButtonAsButton | ButtonAsAnchor | ButtonAsLink);

const Button: React.FC<ButtonProps> = ({
  className,
  icon,
  children,
  isPrimary,
  isSecondary,
  isRed,
  as = "button",
  ...props
}) => {
  const isLink = as === "link";
  const Component: React.ElementType = isLink ? Link : as;

  return (
    <Component
      className={`relative inline-flex justify-center items-center h-10 px-6 rounded-xl text-heading-str ${
        isPrimary
          ? "bg-gradient-to-b from-[#E5E5E5] to-[#E2E2E2] shadow-[0_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#D4D4D4] after:absolute after:inset-0 after:rounded-xl after:bg-white/30 after:opacity-0 after:transition-opacity hover:after:opacity-100"
          : ""
      } ${
        isSecondary
          ? "shadow-[0_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333] text-shade-01 fill-surface-01 after:absolute after:inset-0 after:bg-gradient-to-b after:from-shade-07 after:to-shade-08 after:rounded-xl after:transition-opacity hover:after:opacity-90"
          : ""
      } ${
        isRed
          ? "bg-gradient-to-b from-[#E36323] to-[#DF5A18] shadow-[0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#BF4A0F,0px_3px_4px_-1px_rgba(252,96,16,0.95)] text-shade-01 fill-shade-01 after:absolute after:inset-0 after:rounded-xl after:bg-white/10 after:opacity-0 after:transition-opacity hover:after:opacity-100"
          : ""
      } ${className || ""}`}
      {...(isLink ? (props as LinkProps) : props)}
    >
      {icon && <Icon className="relative z-2" name={icon} />}
      <div className="relative z-2 flex items-center gap-2">{children}</div>
    </Component>
  );
};

export default Button;
