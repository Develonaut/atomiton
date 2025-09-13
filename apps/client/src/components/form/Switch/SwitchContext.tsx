import { createContext, useContext } from "react";

type SwitchContextValue = {
  checked: boolean;
};

export const SwitchContext = createContext<SwitchContextValue | null>(null);

export const useSwitchContext = () => {
  const context = useContext(SwitchContext);
  if (!context) {
    throw new Error("Switch components must be used within a Switch.Root");
  }
  return context;
};
