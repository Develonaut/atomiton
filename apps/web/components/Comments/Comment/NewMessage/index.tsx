import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const NewMessage = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex items-start p-4">
      <div className="shrink-0 mt-1.5">
        <Image
          className="size-8 rounded-full opacity-100"
          src="/images/avatars/6.png"
          width={32}
          height={32}
          alt="Avatar"
        />
      </div>
      <div className="w-[calc(100%-2rem)] pl-4">
        <div className="flex items-start p-1.5 bg-surface-03 rounded-xl">
          <TextareaAutosize
            className="grow h-8 p-2 text-body-lg text-primary outline-none resize-none placeholder:text-secondary"
            maxRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply"
          />
          <Button className="shrink-0 w-8 !h-8 !px-0" isPrimary>
            <Icon className="-rotate-90" name="arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewMessage;
