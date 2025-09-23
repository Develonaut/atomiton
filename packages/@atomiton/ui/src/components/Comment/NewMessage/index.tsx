import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Image from "#components/Image";
import SubmitButton from "#components/SubmitButton";

function NewMessage() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex items-start p-4">
      <div className="shrink-0 mt-1.5">
        <Image
          className="size-8 rounded-full"
          src="/images/avatars/6.png"
          width={32}
          height={32}
          alt="Avatar"
        />
      </div>
      <div className="w-[calc(100%-2rem)] pl-4">
        <div className="flex items-start p-1.5 bg-[#F1F1F1] rounded-xl">
          <TextareaAutosize
            className="grow h-8 p-2 text-[0.8125rem] leading-[1rem] text-primary outline-none resize-none placeholder:text-secondary"
            maxRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply"
          />
          <SubmitButton className="shrink-0" isMedium />
        </div>
      </div>
    </div>
  );
}

export default NewMessage;
