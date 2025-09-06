type Props = {
  className?: string;
  pinned?: boolean;
  uploading?: boolean;
  typing?: boolean;
};

const CommentCursor = ({ className, pinned, uploading, typing }: Props) => (
  <div
    className={`flex items-center justify-center ${
      !pinned && !uploading && !typing
        ? "w-5 h-4.5 border-[1.5px] border-[#121212] rounded-md rounded-bl-[1px] bg-[#FCFCFC] shadow-[0px_2px_4px_rgba(0,0,0,0.15)]"
        : "relative w-7.5 h-7 rounded-[10px] rounded-bl-[2px] shadow-[0px_4px_4px_rgba(18,18,18,0.15)] after:absolute after:inset-0 after:rounded-[10px] after:rounded-bl-[2px] after:border after:border-white/35 after:mask-linear-215 after:mask-linear-from-0% after:mask-linear-to-100%"
    } ${pinned ? "bg-gradient-to-b from-[#323232] to-[#121212]" : ""} ${
      uploading || typing ? "bg-gradient-to-b from-[#34A7FF] to-[#0D7DFD]" : ""
    } ${className || ""}`}
  >
    {typing ? (
      <div className="flex gap-0.5 [&_span]:size-0.5 [&_span]:rounded-full [&_span]:bg-white">
        <span></span>
        <span></span>
        <span></span>
      </div>
    ) : (
      <svg
        className={`${!pinned ? "size-1.75 fill-[#7B7B7B]/50" : ""} ${
          pinned ? "size-2.25 fill-[#7B7B7B]" : ""
        } ${uploading ? "size-2.25 fill-[#FFFFFF]" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        width="8"
        height="8"
        viewBox="0 0 8 8"
      >
        <path d="M4 .25a.75.75 0 0 1 .75.75v2.25H7a.75.75 0 0 1 .743.648L7.75 4a.75.75 0 0 1-.75.75H4.75V7a.75.75 0 0 1-.648.743L4 7.75A.75.75 0 0 1 3.25 7V4.75H1a.75.75 0 0 1-.743-.648L.25 4A.75.75 0 0 1 1 3.25h2.25V1a.75.75 0 0 1 .648-.743L4 .25z" />
      </svg>
    )}
  </div>
);

export default CommentCursor;
