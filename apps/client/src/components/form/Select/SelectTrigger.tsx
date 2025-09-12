import { PropsWithChildren, forwardRef } from "react";
import { ListboxButton } from "@headlessui/react";

type SelectTriggerProps = PropsWithChildren<{
  className?: string;
  isMedium?: boolean;
  isWhite?: boolean;
}>;

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className = "", isMedium = false, isWhite = false }, ref) => {
    const sizeClasses = isMedium ? "h-9 text-body-md" : "h-10 text-body-lg";

    const variantClasses = isWhite
      ? "bg-transparent !border-s-02"
      : "bg-surface-03 data-[hover]:bg-surface-02";

    return (
      <ListboxButton
        ref={ref}
        className={`group flex items-center w-full px-3 border border-s-01 rounded-[0.625rem] text-primary transition-all data-[hover]:border-s-02 data-[open]:border-s-02 data-[open]:bg-transparent outline-0 ${sizeClasses} ${variantClasses} ${className}`}
      >
        {children}
      </ListboxButton>
    );
  },
);

SelectTrigger.displayName = "SelectTrigger";

export default SelectTrigger;
