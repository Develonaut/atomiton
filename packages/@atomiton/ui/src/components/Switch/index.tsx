import { Switch as HeadlessSwitch } from "@headlessui/react";

type SwitchProps = {
  className?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function Switch({ className, checked, onChange }: SwitchProps) {
  return (
    <HeadlessSwitch
      className={`group inline-flex w-10 h-5.5 p-0.5 rounded-full bg-[#ececec] shadow-[0px_0px_1px_0.5px_rgba(18,18,18,0.10)_inset] cursor-pointer transition data-[checked]:shadow-[0_1px_0.6px_0px_rgba(18,18,18,0.30)_inset] data-[checked]:!bg-[#121212]/70 ${
        className || ""
      }`}
      checked={checked}
      onChange={onChange}
    >
      <span className="size-4.5 rounded-full bg-[#f8f7f7] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.82)_inset,0px_0px_2.6px_0px_rgba(0,0,0,0.25),0px_1px_4px_0px_rgba(0,0,0,0.14)] transition group-data-[checked]:bg-[#f8f7f7] group-data-[checked]:shadow-[0px_1px_0.5px_rgba(255,255,255,0.82)_inset,0px_0px_2.6px_0px_rgba(0,0,0,0.25),0px_1px_4px_0px_rgba(0,0,0,0.14)] group-data-[checked]:translate-x-4.5" />
    </HeadlessSwitch>
  );
}

export default Switch;
