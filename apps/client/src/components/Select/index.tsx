import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Icon from "@/components/Icon";

export type SelectOption = {
  id: number;
  name: string;
};

type SelectProps = {
  className?: string;
  classButton?: string;
  classIcon?: string;
  label?: string;
  indicator?: string;
  value: SelectOption | null;
  onChange: (value: SelectOption) => void;
  options: SelectOption[];
  placeholder?: string;
  isMedium?: boolean;
  isWhite?: boolean;
  icon?: string;
};

function Select({
  className,
  classButton,
  classIcon,
  label,
  indicator,
  value = null,
  onChange,
  options,
  placeholder,
  isMedium,
  isWhite,
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
        className={`group flex items-center w-full px-3 border border-s-01 rounded-[0.625rem] text-primary transition-all data-[hover]:border-s-02 data-[open]:border-s-02 data-[open]:bg-transparent outline-0 ${
          isMedium ? "h-9 text-body-md" : "h-10 text-body-lg"
        } ${
          isWhite
            ? "bg-transparent !border-s-02"
            : "bg-surface-03 data-[hover]:bg-surface-02"
        } ${label ? "text-secondary/50" : ""} ${classButton || ""}`}
      >
        {icon && (
          <Icon
            className={`shrink-0 !size-4 mr-1.5 fill-secondary/70 transition-colors group-hover:fill-secondary ${
              classIcon || ""
            }`}
            name={icon}
          />
        )}
        {label && <div className="shrink-0 pr-2 text-primary">{label}</div>}
        {value?.name ? (
          <div className="pr-2 truncate">{value.name}</div>
        ) : (
          <div className="pr-2 truncate text-secondary/80">{placeholder}</div>
        )}
        {indicator && (
          <div className="shrink-0 mr-2 text-secondary">{indicator}</div>
        )}
        <Icon
          className={`shrink-0 ml-auto fill-secondary transition-transform group-[[data-open]]:rotate-180 ${
            isMedium ? "!size-4" : "!size-5"
          }`}
          name="chevron"
        />
      </ListboxButton>
      <ListboxOptions
        className={`z-100 [--anchor-gap:2px] w-[var(--button-width)] p-1 bg-surface-01 border border-s-02 shadow-toolbar rounded-[0.625rem] origin-top transition duration-200 ease-out outline-none data-[closed]:scale-95 data-[closed]:opacity-0 `}
        anchor="bottom"
        transition
        modal={false}
      >
        {options.map((option) => (
          <ListboxOption
            className={`relative p-2 rounded-lg text-secondary cursor-pointer transition-colors data-[focus]:text-primary data-[selected]:bg-surface-03 data-[selected]:text-primary ${
              isMedium ? "text-body-md" : "text-body-lg"
            }`}
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
