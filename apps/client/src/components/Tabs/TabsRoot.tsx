import { PropsWithChildren, createContext, useContext, useState } from "react";

type TabsContextValue = {
  value: string | number;
  onChange: (value: string | number) => void;
  isMedium?: boolean;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabsContext must be used within TabsRoot");
  }
  return context;
};

type TabsRootProps = PropsWithChildren<{
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  isMedium?: boolean;
}>;

function TabsRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  children,
  className = "",
  isMedium = false,
}: TabsRootProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? "",
  );

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = (newValue: string | number) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange, isMedium }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export default TabsRoot;
