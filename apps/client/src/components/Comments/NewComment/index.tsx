import { useState, useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useClickAway } from "react-use";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Emoji from "@/components/Emoji";
import AddFiles from "./AddFiles";
import AddUser from "./AddUser";
import ImagePreview from "./ImagePreview";

type Props = {
  top: number;
  left: number;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  reserve?: boolean;
};

const NewComment = ({ top, left, onClose, onSubmit, reserve }: Props) => {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMessage = message.trim() !== "";
  const ref = useRef(null);

  useClickAway(ref, (e) => {
    if ((e.target as HTMLElement).closest(".headlessui-dropdown")) {
      return;
    }
    onClose();
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (isMessage) {
      onSubmit(message);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setImages((prev) => [...prev, ...imageFiles]);
  };

  const handleAddFilesClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`new-comment absolute w-82 z-50 pl-12 cursor-default ${
        reserve ? "pr-12" : "pl-12"
      }`}
      style={{ top, left }}
      ref={ref}
    >
      <div
        className={`absolute top-2.5 flex items-center justify-center w-7.5 h-7 bg-gradient-to-b rounded-lg rounded-bl-none shadow-[0px_4px_4px_0_rgba(18,18,18,0.15)] after:absolute after:inset-0 after:rounded-lg after:rounded-bl-none after:border after:border-white/25 after:mask-linear-215 after:mask-linear-from-0% after:mask-linear-to-60% ${
          isMessage
            ? "from-[#34A7FF] to-[#0D7DFD]"
            : "from-shade-07 to-shade-09"
        } ${reserve ? "right-0.75" : "left-0.75"}`}
      >
        <Icon
          className={`!size-4 ${isMessage ? "fill-white" : "fill-secondary"}`}
          name={isMessage ? "dots" : "plus-thick"}
        />
      </div>
      <div className="rounded-xl bg-surface-01 border border-s-01 shadow-prompt-input">
        <div className="flex p-2">
          <TextareaAutosize
            ref={textareaRef}
            className="w-full h-8 p-2 text-body-lg text-primary outline-none resize-none placeholder:text-secondary"
            maxRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add comment..."
          />
        </div>
        {isMessage && (
          <>
            <ImagePreview images={images} onRemove={removeImage} />
            <div className="flex justify-between gap-4 mt-2 p-2 border-t border-s-01">
              <div className="flex gap-1">
                <AddFiles onClick={handleAddFilesClick} />
                <AddUser />
                <Emoji
                  classButton="size-8 rounded-[0.625rem] border border-transparent fill-secondary transition-colors hover:bg-surface-03 data-open:bg-surface-03 data-open:border-s-01"
                  classMenuItems="new-comment [--anchor-gap:1rem] [--anchor-offset:-1rem]"
                  onEmojiClick={() => {}}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="w-8 !h-8 !px-0"
                  onClick={handleSubmit}
                  isPrimary
                >
                  <Icon className="-rotate-90" name="arrow" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewComment;
