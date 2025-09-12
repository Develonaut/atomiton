import { ListboxOptions } from "@headlessui/react";
import { PropsWithChildren, forwardRef } from "react";

type SelectOptionsProps = PropsWithChildren<{
  className?: string;
}>;

const SelectOptions = forwardRef<HTMLDivElement, SelectOptionsProps>(
  ({ children, className = "" }, ref) => {
    return (
      <ListboxOptions
        ref={ref}
        className={`z-100 [--anchor-gap:2px] w-[var(--button-width)] p-1 bg-surface-01 border border-s-02 shadow-toolbar rounded-[0.625rem] origin-top transition duration-200 ease-out outline-none data-[closed]:scale-95 data-[closed]:opacity-0 ${className}`}
        anchor="bottom"
        transition
        modal={false}
      >
        {children}
      </ListboxOptions>
    );
  },
);

SelectOptions.displayName = "SelectOptions";

export default SelectOptions;
