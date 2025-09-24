import { SwitchContext } from "#components/form/Switch/SwitchContext";
import SwitchLabel from "#components/form/Switch/SwitchLabel";
import SwitchThumb from "#components/form/Switch/SwitchThumb";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import type { PropsWithChildren } from "react";
import { Children, isValidElement } from "react";

type SwitchRootProps = PropsWithChildren<{
  className?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  fullWidth?: boolean;
}>;

function SwitchRoot({
  className = "",
  checked,
  onChange,
  children,
  fullWidth,
}: SwitchRootProps) {
  // Check if we have a label among children
  const hasLabel = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === SwitchLabel,
  );

  // Default children if none provided
  const defaultContent = <SwitchThumb />;

  // If fullWidth and has label, create a wrapper
  if (fullWidth && hasLabel) {
    const childArray = Children.toArray(children);
    const label = childArray.find(
      (child) => isValidElement(child) && child.type === SwitchLabel,
    );
    const otherChildren = childArray.filter(
      (child) => !isValidElement(child) || child.type !== SwitchLabel,
    );

    return (
      <SwitchContext.Provider value={{ checked }}>
        <div
          className={`flex items-center justify-between w-full ${className}`}
        >
          {label}
          <HeadlessSwitch
            className="group inline-flex w-10 h-5.5 p-0.5 rounded-full bg-shade-04 shadow-[0px_0px_1px_0.5px_rgba(18,18,18,0.10)_inset] transition data-[checked]:shadow-[0_1px_0.6px_0px_rgba(18,18,18,0.30)_inset] data-[checked]:bg-[rgba(18,18,18,0.70)]"
            checked={checked}
            onChange={onChange}
          >
            {otherChildren.length > 0 ? otherChildren : defaultContent}
          </HeadlessSwitch>
        </div>
      </SwitchContext.Provider>
    );
  }

  // Standard inline mode
  const content = children || defaultContent;

  return (
    <SwitchContext.Provider value={{ checked }}>
      <HeadlessSwitch
        className={`group inline-flex w-10 h-5.5 p-0.5 rounded-full bg-shade-04 shadow-[0px_0px_1px_0.5px_rgba(18,18,18,0.10)_inset] transition data-[checked]:shadow-[0_1px_0.6px_0px_rgba(18,18,18,0.30)_inset] data-[checked]:bg-[rgba(18,18,18,0.70)] ${className}`}
        checked={checked}
        onChange={onChange}
      >
        {content}
      </HeadlessSwitch>
    </SwitchContext.Provider>
  );
}

export default SwitchRoot;
