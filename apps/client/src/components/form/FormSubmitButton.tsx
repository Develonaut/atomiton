import { forwardRef } from "react";

interface FormSubmitButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const FormSubmitButton = forwardRef<HTMLButtonElement, FormSubmitButtonProps>(
  (
    {
      isLoading = false,
      loadingText = "Loading...",
      children,
      className = "",
      disabled = false,
      variant = "primary",
      size = "md",
      type = "submit",
      onClick,
      ...props
    },
    ref,
  ) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "secondary":
          return "bg-surface-03 text-primary border border-surface-03 hover:bg-surface-02 hover:border-s-02";
        case "primary":
        default:
          return "bg-[#000] text-white hover:bg-[#1a1a1a]";
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-8 px-3 text-xs";
        case "lg":
          return "h-11 px-6 text-base";
        case "md":
        default:
          return "h-9 px-4 text-sm";
      }
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={`w-full font-medium rounded-lg transition-colors ${getSizeClasses()} ${
          isDisabled
            ? "bg-[#666] cursor-not-allowed text-white/70"
            : getVariantClasses()
        } ${className}`}
        {...props}
      >
        {isLoading ? loadingText : children}
      </button>
    );
  },
);

FormSubmitButton.displayName = "FormSubmitButton";

export default FormSubmitButton;
