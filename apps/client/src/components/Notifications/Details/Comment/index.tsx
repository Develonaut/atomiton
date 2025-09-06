import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Button from "@/components/Button";

function Comment() {
  const [message, setMessage] = useState("");
  const isMessage = message !== "";

  const actions = [
    {
      icon: "plus-circle",
      onClick: () => {},
    },
    {
      icon: "emoji",
      onClick: () => {},
    },
    {
      icon: "like",
      onClick: () => {},
    },
    {
      icon: "dislike",
      onClick: () => {},
    },
  ];

  return (
    <div className="mt-2 p-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Image
            className="size-9 rounded-full opacity-100"
            src="/images/avatars/3.png"
            width={36}
            height={36}
            alt="Avatar"
          />
        </div>
        <div className="grow">
          <div className="">
            <span className="text-body-lg-str">Randomdash</span>
            <span className="ml-1 text-secondary/50">1h</span>
          </div>
          <div className="mt-1 line-clamp-3 text-p-sm text-secondary/80">
            These draggabale sliders look really cool. Maybe these could be
            displayed when you hold shift, to rotate exactly on the X or Y. But
            by default I don&apos;t think we need these controllers, you could
            just rotate the object by clicking and dragging anywhere as expected
            on any 3D tool (theoretically).
          </div>
          <button className="inline-flex items-center gap-2 h-7 mt-2 px-2 border border-s-02 rounded-lg text-body-lg-str transition-colors hover:bg-surface-02">
            <span>👍</span>
            <span>2</span>
          </button>
        </div>
      </div>
      <div className="flex items-start gap-3 mt-4">
        <div className="shrink-0">
          <Image
            className="size-9 rounded-full opacity-100"
            src="/images/avatars/1.png"
            width={36}
            height={36}
            alt="Avatar"
          />
        </div>
        <div className="grow">
          <div className="text-body-lg-str">Tran Mau Tri Tam ✪</div>
          <TextareaAutosize
            className="w-full mt-1 text-p-sm text-primary outline-none resize-none placeholder:text-secondary/80"
            maxRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your 3D object or scene..."
            autoFocus
          />
        </div>
      </div>
      <div className="flex justify-between gap-4 mt-4">
        <div className="flex gap-1">
          {actions.map((action) => (
            <button
              className="group size-9 rounded-lg transition-colors hover:bg-surface-03"
              key={action.icon}
            >
              <Icon
                className="fill-secondary/70 transition-colors group-hover:fill-primary"
                name={action.icon}
              />
            </button>
          ))}
        </div>
        <Button
          className="!h-9 !px-5"
          isPrimary={!isMessage}
          isSecondary={isMessage}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default Comment;
