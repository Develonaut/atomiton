import { useState, useRef } from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
};

function NewField({ value, onChange, placeholder, type }: Props) {
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
        className="w-30 h-5 text-[0.75rem] font-medium truncate bg-transparent rounded-none outline-0"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type || "text"}
      />
      <button className="group shrink-0 cursor-pointer" onClick={handleSave}>
        <svg
          className={`size-4 transition-colors ${
            value !== "" ? "fill-[#49BA61]" : "fill-[#7B7B7B]"
          }`}
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M15.384 4.343a.89.89 0 0 1 1.286-.126c.388.334.443.931.121 1.334L8.729 15.657a.89.89 0 0 1-1.246.157L3.37 12.656a.97.97 0 0 1-.191-1.325.89.89 0 0 1 1.277-.198l3.417 2.623 7.51-9.413z" />
        </svg>
      </button>
    </div>
  ) : (
    <div
      className="flex items-center gap-2 transition-opacity cursor-pointer hover:opacity-50"
      onClick={handleEdit}
    >
      <div className="text-[0.75rem] font-medium">{value}</div>
      <button className="">
        <svg
          className="!size-4 fill-secondary"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M11.86 4.122c.829-.83 2.174-.83 3.004 0l1.014 1.014c.829.829.829 2.174 0 3.004l-1.721 1.721-6.017 6.017c-.398.398-.939.622-1.502.622H4.41a.91.91 0 0 1-.91-.91v-2.228c0-.563.224-1.104.622-1.502l6.017-6.017 1.721-1.721zm-1.077 3.653l-5.373 5.372c-.057.057-.089.134-.089.215v1.317h1.318c.054 0 .106-.014.152-.041l.063-.048 5.373-5.373-1.443-1.443zm2.794-2.365c-.118-.118-.311-.118-.429 0L12.07 6.487l1.443 1.443 1.077-1.077c.099-.099.115-.249.049-.364l-.049-.065-1.014-1.014z" />
        </svg>
      </button>
    </div>
  );
}

export default NewField;
