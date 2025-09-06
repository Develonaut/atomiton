import { useState } from "react";
import Image from "@/components/Image";
import TextareaAutosize from "react-textarea-autosize";
import Button from "@/components/Button";

function Comment() {
  const [message, setMessage] = useState("");

  const actions = [
    {
      path: "M9.998 1.54a8.46 8.46 0 0 1 8.458 8.458 8.46 8.46 0 0 1-8.458 8.458A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54zm0 1.5A6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.96 6.96 0 0 0 6.958-6.958A6.96 6.96 0 0 0 9.998 3.04zm0 2.673a.75.75 0 0 1 .75.75v2.785l2.786.001a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.75.75l-2.786-.001v2.786a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75v-2.786l-2.785.001a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75l2.785-.001V6.463a.75.75 0 0 1 .648-.743l.102-.007z",
      onClick: () => {},
    },
    {
      path: "M9.998 1.54a8.46 8.46 0 0 1 8.458 8.458 8.46 8.46 0 0 1-8.458 8.458A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54zm0 1.5A6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.96 6.96 0 0 0 6.958-6.958A6.96 6.96 0 0 0 9.998 3.04zm4.583 6.208a.75.75 0 0 1 .75.75c0 2.946-2.388 5.333-5.333 5.333s-5.333-2.388-5.333-5.333a.75.75 0 1 1 1.5 0c0 2.117 1.716 3.833 3.833 3.833s3.833-1.716 3.833-3.833a.75.75 0 0 1 .75-.75zm-6.667-3a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 1 1 0-2.5zm4.167 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 1 1 0-2.5z",
      onClick: () => {},
    },
    {
      path: "M3.123 18.043c-.874 0-1.583-.709-1.583-1.583v-6.25c0-.874.709-1.583 1.583-1.583l2.15-.001 2.993-5.808c.249-.483.727-.802 1.261-.851l.147-.007a2.42 2.42 0 0 1 2.392 2.789l-.345 2.211h3.493a3.25 3.25 0 0 1 3.236 3.555l-.023.184-.698 4.583a3.25 3.25 0 0 1-3.213 2.761H5.623h-2.5zm1.75-1.5v-6.417l-1.75.001c-.035 0-.064.021-.077.051l-.007.032v6.25c0 .046.037.083.083.083h1.75zM9.674 3.46c-.032 0-.061.018-.075.045L6.373 9.767v6.776h8.144a1.75 1.75 0 0 0 1.701-1.338l.029-.148.697-4.583a1.75 1.75 0 0 0-1.73-2.013h-4.369a.75.75 0 0 1-.741-.866l.48-3.077a.92.92 0 0 0-.91-1.058z",
      onClick: () => {},
    },
    {
      path: "M16.881 1.96c.874 0 1.583.709 1.583 1.583v6.25c0 .874-.709 1.583-1.583 1.583h-2.15l-2.993 5.808c-.249.483-.727.802-1.261.851l-.147.007a2.42 2.42 0 0 1-2.392-2.789l.345-2.211H4.791a3.25 3.25 0 0 1-3.236-3.555l.023-.184.698-4.583A3.25 3.25 0 0 1 5.488 1.96h8.893 2.5zm-1.75 1.5v6.417h1.75c.035 0 .064-.021.077-.051l.007-.032v-6.25c0-.046-.037-.083-.083-.083h-1.75zm-4.801 13.083c.032 0 .061-.018.075-.045l3.226-6.262V3.46H5.488a1.75 1.75 0 0 0-1.701 1.338l-.029.148-.697 4.583a1.75 1.75 0 0 0 1.73 2.013H9.16a.75.75 0 0 1 .741.866l-.48 3.077a.92.92 0 0 0 .91 1.058z",
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
          <div className="flex">
            <span className="text-[0.8125rem] leading-[1rem] font-semibold text-[#121212]">
              Randomdash
            </span>
            <span className="ml-1 text-[0.75rem] leading-[1rem] text-[#7B7B7B]/50">
              1h
            </span>
          </div>
          <div className="mt-1 line-clamp-3 text-[0.8125rem] leading-[1.25rem] text-[#7B7B7B]">
            These draggabale sliders look really cool. Maybe these could be
            displayed when you hold shift, to rotate exactly on the X or Y. But
            by default I don&apos;t think we need these controllers, you could
            just rotate the object by clicking and dragging anywhere as expected
            on any 3D tool (theoretically).
          </div>
          <button className="flex justify-center items-center gap-2 h-7 mt-2 px-2 border border-[#E2E2E2] rounded-lg text-[0.8125rem] leading-[1rem] font-semibold cursor-pointer transition-all hover:bg-[#F8F7F7] active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)_inset] active:bg-[#F8F7F7]">
            👍 <span>2</span>
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
          <div className="text-[0.8125rem] leading-[1rem] font-semibold text-[#121212]">
            Tran Mau Tri Tam ✪
          </div>
          <TextareaAutosize
            className="w-full mt-1 text-[0.8125rem] leading-[1.25rem] text-[#121212] outline-none resize-none placeholder:text-[#7B7B7B]/80"
            maxRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply to @randomfash"
            autoFocus
          />
        </div>
      </div>
      <div className="flex justify-between gap-4 mt-4">
        <div className="flex gap-1">
          {actions.map((action, index) => (
            <button
              className="group flex justify-center items-center size-9 rounded-lg transition-colors cursor-pointer hover:bg-[#F1F1F1]"
              key={index}
            >
              <svg
                className="size-5 fill-[#7B7B7B]/70 transition-colors group-hover:fill-[#7B7B7B]"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d={action.path} />
              </svg>
            </button>
          ))}
        </div>
        <Button className="!h-9" isPrimary>
          Send
        </Button>
      </div>
    </div>
  );
}

export default Comment;
