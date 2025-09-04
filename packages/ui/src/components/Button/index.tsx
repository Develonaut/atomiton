import React from "react";
import Link from "@/components/Link";

type CommonProps = {
  className?: string;
  children?: React.ReactNode;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isOrange?: boolean;
  isSmall?: boolean;
  disabled?: boolean;
};

type ButtonAsButton = {
  as?: "button";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsAnchor = {
  as: "a";
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonAsLink = {
  as: "link";
  href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonProps = CommonProps &
  (ButtonAsButton | ButtonAsAnchor | ButtonAsLink);

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  isPrimary,
  isSecondary,
  isOrange,
  isSmall,
  disabled,
  as = "button",
  ...props
}) => {
  const isLink = as === "link";
  const Component: React.ElementType = isLink ? Link : as;

  return (
    <Component
      className={`relative inline-flex justify-center items-center leading-[1.25rem] font-semibold cursor-pointer transition-all ${
        isPrimary
          ? "bg-gradient-to-b from-[#E5E5E5] to-[#E2E2E2] shadow-[0_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#D4D4D4] after:absolute after:inset-0 after:rounded-xl after:bg-white/40 after:opacity-0 after:transition-opacity hover:after:opacity-100 hover:shadow-[0px_3px_8px_-2px_rgba(0,0,0,0.30),0px_1px_0px_0px_rgba(255,255,255,0.70)_inset,0px_0px_0px_1px_#E6E6E6] active:after:opacity-0"
          : ""
      } ${
        isSecondary
          ? "shadow-[0_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333] text-[#FCFCFC] after:absolute after:inset-0 after:bg-gradient-to-b after:from-[#323232] after:to-[#222222] after:rounded-xl after:transition-opacity hover:after:opacity-90 active:after:opacity-100"
          : ""
      } ${
        isOrange
          ? "bg-gradient-to-b from-[#E36323] to-[#DF5A18] shadow-[0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#BF4A0F,0px_3px_4px_-1px_rgba(252,96,16,0.95)] text-[#FCFCFC] after:absolute after:inset-0 after:rounded-xl after:bg-white/100 after:opacity-0 after:transition-opacity hover:after:opacity-10 active:after:opacity-0"
          : ""
      } ${
        isSmall
          ? "h-9 px-5 rounded-[0.625rem] text-[0.75rem]"
          : "h-10 px-6 rounded-xl text-[0.875rem]"
      } ${disabled ? "opacity-30 pointer-events-none" : ""} ${className || ""}`}
      {...(isLink ? (props as LinkProps) : props)}
    >
      <span className="relative z-2 flex items-center gap-2">{children}</span>
    </Component>
  );
};

export default Button;
