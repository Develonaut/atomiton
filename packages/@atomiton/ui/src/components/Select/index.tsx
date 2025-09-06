import type { ReactNode } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";

export type SelectOption = {
  id: number;
  name: string;
};

type SelectProps = {
  className?: string;
  classButton?: string;
  classOptions?: string;
  classOption?: string;
  label?: string;
  indicator?: string;
  value: SelectOption | null;
  onChange: (value: SelectOption) => void;
  options: SelectOption[];
  placeholder?: string;
  isSmall?: boolean;
  isWhite?: boolean;
  isMinimal?: boolean;
  icon?: ReactNode;
};

function Select({
  className,
  classButton,
  classOptions,
  classOption,
  label,
  indicator,
  value = null,
  onChange,
  options,
  placeholder,
  isSmall,
  isWhite,
  isMinimal,
  icon,
}: SelectProps) {
  return (
    <Listbox
      className={`${className || ""}`}
      value={value}
      onChange={onChange}
      as="div"
    >
      <ListboxButton
        className={`group flex items-center gap-1.5 w-full pl-3 pr-2 border border-[#ececec] rounded-[0.625rem] font-medium leading-[1rem] transition-all cursor-pointer [&_svg]:fill-[#7B7B7B]/70 [&_svg]:size-4 data-[hover]:border-[#E2E2E2] data-[open]:border-[#e2e2e2] data-[open]:bg-transparent focus:bg-[#FCFCFC] ${
          isSmall ? "h-8 text-[0.75rem] [&_svg]" : "h-9 text-[0.8125rem]"
        } ${
          isWhite
            ? "bg-transparent !border-s-02"
            : "bg-[#F1F1F1] data-[hover]:bg-[#F8F7F7]"
        } ${
          isMinimal
            ? "!border-0 !bg-transparent data-[hover]:!bg-[#F1F1F1]"
            : ""
        } ${label ? "text-[#7B7B7B]/50" : ""} ${classButton || ""}`}
      >
        {icon && (icon as any)}
        {label && <div className="shrink-0 text-[#000]">{label}</div>}
        {value?.name ? (
          <div className="truncate">{value.name}</div>
        ) : (
          <div className="truncate text-[#7B7B7B]/80">{placeholder}</div>
        )}
        {indicator && (
          <div className="shrink-0 text-[#7B7B7B]">{indicator}</div>
        )}
        <svg
          className="shrink-0 size-4 ml-auto !fill-[#7B7B7B] transition-transform group-[[data-open]]:rotate-180"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M11.371 12.38c-.757.827-1.985.827-2.742 0l-3.36-3.668a1.07 1.07 0 0 1 0-1.418c.359-.392.94-.392 1.299 0l3.36 3.668c.04.044.104.044.144 0l3.36-3.668c.359-.392.94-.392 1.299 0a1.07 1.07 0 0 1 0 1.418l-3.36 3.668z" />
        </svg>
      </ListboxButton>
      <ListboxOptions
        className={`z-100 [--anchor-gap:2px] w-[var(--button-width)] p-1 bg-[#fcfcfc] border border-[#E2E2E2] shadow-[0px_1px_4px_-4px_rgba(0,0,0,0.075),0px_8px_16px_-12px_rgba(0,0,0,0.125)] rounded-[0.625rem] origin-top transition duration-200 ease-out outline-none data-[closed]:scale-95 data-[closed]:opacity-0 ${
          classOptions || ""
        }`}
        anchor="bottom"
        transition
        modal={false}
      >
        {options.map((option) => (
          <ListboxOption
            className={`relative p-2 rounded-lg font-medium leading-[1rem] text-[#7B7B7B] cursor-pointer transition-colors data-[focus]:text-[#000] data-[selected]:bg-[#f1f1f1] data-[selected]:text-[#000] ${
              isSmall ? "text-[0.75rem]" : "text-[0.8125rem]"
            } ${classOption || ""}`}
            key={option.id}
            value={option}
          >
            {option.name}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}

export default Select;
