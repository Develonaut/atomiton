import CommentCursor from "#components/CommentCursor";
import SubmitButton from "#components/SubmitButton";
import ImagePreview from "#components/NewComment/ImagePreview";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

function NewComment() {
  const [message, setMessage] = useState("");
  const isMessage = message.trim() !== "";

  return (
    <div className="flex gap-4">
      <CommentCursor
        className="mt-2.5"
        pinned={!isMessage}
        typing={isMessage}
      />
      <div className="w-70 rounded-xl bg-[#FCFCFC] border border-[#ECECEC] shadow-[0px_18px_24px_-20px_rgba(0,0,0,0.13),0px_2px_0px_0px_#FFF_inset,0px_8px_16px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex p-2">
          <TextareaAutosize
            className="w-full h-8 p-2 text-[0.8125rem] leading-[1rem] text-primary outline-none resize-none placeholder:text-secondary"
            maxRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add comment..."
          />
        </div>
        {isMessage && (
          <>
            <ImagePreview
              images={["/images/effects/1.png", "/images/effects/2.png"]}
            />
            <div className="flex justify-between gap-4 mt-2 p-2 border-t border-[#ECECEC]">
              <div className="flex gap-1">
                <button className="flex justify-center items-center size-8 rounded-[0.625rem] cursor-pointer transition-colors hover:bg-[#F1F1F1]">
                  <svg
                    className="size-5 fill-[#7B7B7B]"
                    width={20}
                    height={20}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.998 1.54a8.46 8.46 0 0 1 8.458 8.458 8.46 8.46 0 0 1-8.458 8.458A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54zm0 1.5A6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.96 6.96 0 0 0 6.958-6.958A6.96 6.96 0 0 0 9.998 3.04zm0 2.673a.75.75 0 0 1 .75.75v2.785l2.786.001a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.75.75l-2.786-.001v2.786a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75v-2.786l-2.785.001a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75l2.785-.001V6.463a.75.75 0 0 1 .648-.743l.102-.007z" />
                  </svg>
                </button>
                <button className="flex justify-center items-center size-8 rounded-[0.625rem] cursor-pointer transition-colors hover:bg-[#F1F1F1]">
                  <svg
                    className="size-5 fill-[#7B7B7B]"
                    width={20}
                    height={20}
                    viewBox="0 0 20 20"
                  >
                    <path d="M12.375 12.518c-.796 1.079-2.054 1.706-3.386 1.519-2.029-.285-3.374-2.341-3.063-4.554s2.17-3.818 4.199-3.533a3.39 3.39 0 0 1 1.943.983l.101.106.022-.145a.75.75 0 0 1 .748-.642l.102.008a.75.75 0 0 1 .634.85l-.441 3.037a2.01 2.01 0 0 0 1.808 2.286c1.193.109 1.914-.883 1.914-2.433A6.96 6.96 0 0 0 9.998 3.04 6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.92 6.92 0 0 0 3.662-1.04.75.75 0 1 1 .791 1.275 8.42 8.42 0 0 1-4.452 1.265A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54a8.46 8.46 0 0 1 8.458 8.458c0 2.326-1.312 4.13-3.55 3.927-1.033-.094-1.916-.624-2.49-1.389l-.028-.038-.014.021zM9.918 7.435c-1.161-.163-2.304.823-2.505 2.257s.625 2.696 1.786 2.86 2.304-.823 2.505-2.257-.625-2.697-1.786-2.86z" />
                  </svg>
                </button>
                <button className="flex justify-center items-center size-8 rounded-[0.625rem] cursor-pointer transition-colors hover:bg-[#F1F1F1]">
                  <svg
                    className="size-5 fill-[#7B7B7B]"
                    width={20}
                    height={20}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.998 1.54a8.46 8.46 0 0 1 8.458 8.458 8.46 8.46 0 0 1-8.458 8.458A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54zm0 1.5A6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.96 6.96 0 0 0 6.958-6.958A6.96 6.96 0 0 0 9.998 3.04zm4.583 6.208a.75.75 0 0 1 .75.75c0 2.946-2.388 5.333-5.333 5.333s-5.333-2.388-5.333-5.333a.75.75 0 1 1 1.5 0c0 2.117 1.716 3.833 3.833 3.833s3.833-1.716 3.833-3.833a.75.75 0 0 1 .75-.75zm-6.667-3a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 1 1 0-2.5zm4.167 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 1 1 0-2.5z" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <SubmitButton isMedium />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NewComment;
