import { useState } from "react";
import Button from "#components/Button";
import Select from "#components/form/Select";

const accesses = [
  { id: 0, name: "can view" },
  { id: 1, name: "can edit" },
];

function Head() {
  const [search, setSearch] = useState("");
  const [access, setAccess] = useState(accesses[0]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual share functionality
  };

  return (
    <div className="flex gap-1.5 p-4">
      <form className="relative grow" onSubmit={handleSubmit}>
        <input
          className="w-full h-10 pl-4 pr-28 border border-s-02 rounded-xl outline-0 bg-surface-02 shadow-[0px_1px_3px_0px_rgba(18,18,18,0.10)_inset] text-body-md text-primary placeholder:text-secondary/50 transition-colors focus:border-shade-06/50"
          type="text"
          placeholder="Email, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <Select
          value={access}
          onChange={setAccess}
          className="absolute top-1 right-1 min-w-25.5"
        >
          <Select.Trigger
            className="!h-8 !pr-2 !rounded-lg !border-transparent !bg-surface-01 shadow-[0px_0px_4px_0px_rgba(18,18,18,0.10)]"
            isMedium
          >
            {access && <Select.Value>{access.name}</Select.Value>}
            <Select.Indicator isMedium />
          </Select.Trigger>
          <Select.Options>
            {accesses.map((option) => (
              <Select.Option key={option.id} value={option} isMedium>
                {option.name}
              </Select.Option>
            ))}
          </Select.Options>
        </Select>
      </form>
      <Button isSecondary>Invite</Button>
    </div>
  );
}

export default Head;
