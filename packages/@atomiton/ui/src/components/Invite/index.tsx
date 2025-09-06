import { useState } from "react";
import Field from "@/components/Field";
import type { SelectOption } from "@/components/Select";
import Select from "@/components/Select";

const viewOptions = [
  { id: 0, name: "can view" },
  { id: 1, name: "can edit" },
];

type Props = {
  className?: string;
};

function Invite({ className }: Props) {
  const [value, setValue] = useState("");
  const [view, setView] = useState<SelectOption | null>(viewOptions[0] ?? null);

  return (
    <div className={`relative ${className || ""}`}>
      <Field
        className=""
        classInput="!h-10 !pl-4 !pr-28 !bg-[#F8F7F7] shadow-[0_1px_3px_0_rgba(18,18,18,0.10)_inset] placeholder:opacity-50"
        placeholder="Email, name..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Select
        className="absolute top-1 right-1 w-25.5"
        classButton="!h-8 !text-[0.75rem] !bg-[#FCFCFC] !border-none !rounded-lg shadow-[0_0_4px_0_rgba(18,18,18,0.10)]"
        classOptions="![--anchor-gap:0.5rem]"
        classOption="!text-[0.75rem]"
        value={view}
        onChange={setView}
        options={viewOptions}
      />
    </div>
  );
}

export default Invite;
