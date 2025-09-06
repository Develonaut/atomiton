import { useState, useRef, useEffect } from "react";
import Icon from "@/components/Icon";

function NewFolder() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="">
      <button
        className="flex items-center w-full p-1 rounded-xl text-body-md-str transition-colors hover:bg-surface-03"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-center items-center size-8 mr-3 rounded-lg">
          <Icon className="fill-secondary" name="folder-add" />
        </div>
        New Folder
      </button>
      {isOpen && (
        <div className="relative mt-0.5">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="#7240F1"
            viewBox="0 0 20 20"
          >
            <path opacity=".2" d="M2 10.385h16v6H2z" />
            <path d="M7.441 2.76c.808 0 1.563.404 2.011 1.076l.677 1.016c.17.255.456.408.763.408h5.15c1.335 0 2.417 1.082 2.417 2.417v7.083c0 1.335-1.082 2.417-2.417 2.417H3.958c-1.335 0-2.417-1.082-2.417-2.417V5.177c0-1.335 1.082-2.417 2.417-2.417h3.483zm0 1.5H3.958c-.506 0-.917.41-.917.917v9.583c0 .506.41.917.917.917h12.083c.506 0 .917-.41.917-.917V7.677c0-.506-.41-.917-.917-.917h-5.15c-.808 0-1.563-.404-2.011-1.076l-.677-1.016c-.17-.255-.456-.408-.763-.408z" />
          </svg>
          <input
            className="w-full h-10 pl-12 rounded-xl bg-surface-03 border border-s-01 text-body-md-str outline-0 text-primary placeholder:text-secondary/50"
            type="text"
            placeholder="Untitled Folder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            ref={inputRef}
          />
        </div>
      )}
    </div>
  );
}

export default NewFolder;
