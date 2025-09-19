import type { ReactNode } from "react";
import { forwardRef } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  type ListboxButtonProps,
  type ListboxOptionsProps,
  type ListboxOptionProps,
} from "@headlessui/react";
import { cn } from "../../utils/cn";

export type SelectOption = {
  id: number | string;
  name: string;
  value?: unknown;
};

type SelectRootProps<T = SelectOption | null> = {
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

function SelectRoot<T = SelectOption | null>({
  value,
  onChange,
  children,
  className,
  disabled = false,
}: SelectRootProps<T>) {
  return (
    <Listbox
      className={cn("relative", className)}
      value={value}
      onChange={onChange}
      disabled={disabled}
      as="div"
    >
      {children}
    </Listbox>
  );
}

type SelectTriggerProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "white" | "minimal";
  size?: "sm" | "md" | "lg";
} & Omit<ListboxButtonProps, "className">;

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    { children, className, variant = "default", size = "md", ...props },
    ref,
  ) => {
    const variantStyles = {
      default: "bg-[#F1F1F1] border-[#ececec] data-[hover]:bg-[#F8F7F7]",
      white: "bg-transparent border-[#E2E2E2]",
      minimal: "border-transparent bg-transparent data-[hover]:bg-[#F1F1F1]",
    };

    const sizeStyles = {
      sm: "h-8 text-xs px-2.5",
      md: "h-9 text-[0.8125rem] px-3",
      lg: "h-10 text-sm px-3.5",
    };

    return (
      <ListboxButton
        ref={ref}
        className={cn(
          "group flex items-center gap-1.5 w-full",
          "pr-2 border rounded-[0.625rem]",
          "font-medium leading-4 transition-all cursor-pointer",
          "data-[open]:border-[#e2e2e2] data-[open]:bg-transparent",
          "focus:bg-[#FCFCFC] focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </ListboxButton>
    );
  },
);

SelectTrigger.displayName = "SelectTrigger";

type SelectValueProps = {
  placeholder?: string;
  children?: ReactNode;
  className?: string;
};

function SelectValue({ placeholder, children, className }: SelectValueProps) {
  return (
    <div className={cn("truncate flex-1", className)}>
      {children || (
        <span className="text-[#7B7B7B]/80">{placeholder || "Select..."}</span>
      )}
    </div>
  );
}

type SelectIconProps = {
  children: ReactNode;
  className?: string;
};

function SelectIcon({ children, className }: SelectIconProps) {
  return (
    <div
      className={cn(
        "shrink-0 [&_svg]:size-4 [&_svg]:fill-[#7B7B7B]/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

type SelectIndicatorProps = {
  className?: string;
  children?: ReactNode;
};

function SelectIndicator({ className, children }: SelectIndicatorProps) {
  if (children) {
    return (
      <div className={cn("shrink-0 text-[#7B7B7B]", className)}>{children}</div>
    );
  }

  return (
    <svg
      className={cn(
        "shrink-0 size-4 ml-auto !fill-[#7B7B7B]",
        "transition-transform group-data-[open]:rotate-180",
        className,
      )}
      width={20}
      height={20}
      viewBox="0 0 20 20"
    >
      <path d="M11.371 12.38c-.757.827-1.985.827-2.742 0l-3.36-3.668a1.07 1.07 0 0 1 0-1.418c.359-.392.94-.392 1.299 0l3.36 3.668c.04.044.104.044.144 0l3.36-3.668c.359-.392.94-.392 1.299 0a1.07 1.07 0 0 1 0 1.418l-3.36 3.668z" />
    </svg>
  );
}

type SelectOptionsProps = {
  children: ReactNode;
  className?: string;
} & Omit<ListboxOptionsProps, "className">;

const SelectOptions = forwardRef<HTMLDivElement, SelectOptionsProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ListboxOptions
        ref={ref}
        className={cn(
          "z-[100] [--anchor-gap:2px] w-[var(--button-width)]",
          "p-1 bg-[#fcfcfc] border border-[#E2E2E2]",
          "shadow-[0px_1px_4px_-4px_rgba(0,0,0,0.075),0px_8px_16px_-12px_rgba(0,0,0,0.125)]",
          "rounded-[0.625rem] origin-top",
          "transition duration-200 ease-out outline-none",
          "data-[closed]:scale-95 data-[closed]:opacity-0",
          className,
        )}
        anchor="bottom"
        transition
        modal={false}
        {...props}
      >
        {children}
      </ListboxOptions>
    );
  },
);

SelectOptions.displayName = "SelectOptions";

type SelectOptionProps = {
  children: ReactNode;
  className?: string;
  value: SelectOption;
} & Omit<ListboxOptionProps, "className" | "value">;

const SelectOption = forwardRef<HTMLDivElement, SelectOptionProps>(
  ({ children, className, value, ...props }, ref) => {
    return (
      <ListboxOption
        ref={ref}
        className={cn(
          "relative p-2 rounded-lg",
          "font-medium leading-4 text-[0.8125rem] text-[#7B7B7B]",
          "cursor-pointer transition-colors",
          "data-[focus]:text-[#000] data-[focus]:bg-[#f8f8f8]",
          "data-[selected]:bg-[#f1f1f1] data-[selected]:text-[#000]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        value={value}
        {...props}
      >
        {children}
      </ListboxOption>
    );
  },
);

SelectOption.displayName = "SelectOption";

type SelectLabelProps = {
  children: ReactNode;
  className?: string;
};

function SelectLabel({ children, className }: SelectLabelProps) {
  return (
    <div className={cn("shrink-0 text-[#000] font-medium", className)}>
      {children}
    </div>
  );
}

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Indicator: SelectIndicator,
  Options: SelectOptions,
  Option: SelectOption,
  Label: SelectLabel,
};

type LegacySelectProps = {
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
  isMedium?: boolean;
  isWhite?: boolean;
  isMinimal?: boolean;
  icon?: ReactNode | string;
  disabled?: boolean;
};

export function LegacySelect({
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
  isMedium,
  isWhite,
  isMinimal,
  icon,
  disabled = false,
}: LegacySelectProps) {
  const size = isSmall ? "sm" : isMedium ? "md" : "md";
  const variant = isMinimal ? "minimal" : isWhite ? "white" : "default";

  // Handle icon if it's a string (icon name)
  const iconElement =
    typeof icon === "string" ? (
      <svg className="size-4" viewBox="0 0 20 20">
        {/* This would need to be replaced with actual icon lookup */}
        <rect width="20" height="20" />
      </svg>
    ) : (
      icon
    );

  // Type assertion to handle the value type mismatch
  const handleChange = (newValue: SelectOption | null) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <Select.Root
      value={value}
      onChange={handleChange as (value: SelectOption | null) => void}
      className={className}
      disabled={disabled}
    >
      <Select.Trigger className={classButton} size={size} variant={variant}>
        {iconElement && <Select.Icon>{iconElement}</Select.Icon>}
        {label && <Select.Label>{label}</Select.Label>}
        <Select.Value placeholder={placeholder}>{value?.name}</Select.Value>
        <Select.Indicator>{indicator}</Select.Indicator>
      </Select.Trigger>
      <Select.Options className={classOptions}>
        {options.map((option) => (
          <Select.Option key={option.id} value={option} className={classOption}>
            {option.name}
          </Select.Option>
        ))}
      </Select.Options>
    </Select.Root>
  );
}
