import { useState, useRef } from "react";
import Icon from "@/components/Icon";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
};

function Field({ value, onChange, placeholder, type }: Props) {
  const [edit, setEdit] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setEdit(true);
    setPreviousValue(value);
    onChange({
      target: {
        value: "",
      },
    } as React.ChangeEvent<HTMLInputElement>);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSave = () => {
    setEdit(false);
    onChange({
      target: {
        value: value === "" ? previousValue : value,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return edit ? (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        className="w-30 h-5 text-body-md text-primary truncate bg-transparent rounded-none outline-0"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type || "text"}
      />
      <button className="group shrink-0" onClick={handleSave}>
        <Icon
          className={`!size-4 transition-colors ${
            value !== "" ? "fill-green" : "fill-secondary"
          }`}
          name="check"
        />
      </button>
    </div>
  ) : (
    <div
      className="flex items-center gap-2 transition-opacity cursor-pointer hover:opacity-50"
      onClick={handleEdit}
    >
      <div className="">{value}</div>
      <button className="">
        <Icon className="!size-4 fill-secondary" name="pencil" />
      </button>
    </div>
  );
}

export default Field;
