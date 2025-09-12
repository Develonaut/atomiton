import { ListboxOption } from "@headlessui/react";
import { PropsWithChildren } from "react";

type SelectOptionProps = PropsWithChildren<{
  value: any;
  className?: string;
  isMedium?: boolean;
}>;

function SelectOption({
  value,
  children,
  className = "",
  isMedium = false,
}: SelectOptionProps) {
  const sizeClasses = isMedium ? "text-body-md" : "text-body-lg";

  return (
    <ListboxOption
      className={`relative p-2 rounded-lg text-secondary cursor-pointer transition-colors data-[focus]:text-primary data-[selected]:bg-surface-03 data-[selected]:text-primary ${sizeClasses} ${className}`}
      value={value}
    >
      {children || value}
    </ListboxOption>
  );
}

export default SelectOption;
