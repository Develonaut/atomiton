import { PropsWithChildren, createContext, useContext } from "react";
import { Listbox } from "@headlessui/react";

type SelectContextValue = {
  value: any;
};

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  return context;
};

type SelectRootProps<T = any> = PropsWithChildren<{
  value: T;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
}>;

function SelectRoot<T = any>({
  value,
  onChange,
  children,
  className = "",
  disabled = false,
}: SelectRootProps<T>) {
  return (
    <SelectContext.Provider value={{ value }}>
      <Listbox
        className={className}
        value={value}
        onChange={onChange}
        disabled={disabled}
        as="div"
      >
        {children}
      </Listbox>
    </SelectContext.Provider>
  );
}

export default SelectRoot;
