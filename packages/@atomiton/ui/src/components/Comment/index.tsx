import CommentPin from "#components/CommentPin";
import Message from "./Message";
import NewMessage from "./NewMessage";

type Props = {
  comments: {
    name: string;
    content: React.ReactNode;
    time: string;
    avatar: string;
  }[];
  isRead?: boolean;
};

function Comment({ comments, isRead }: Props) {
  return (
    <div className="flex items-start gap-3.5">
      <CommentPin
        avatars={comments.map((comment) => comment.avatar)}
        isRead={isRead}
      />
      <div className="relative w-70 bg-[#FCFCFC] border border-[#ECECEC] shadow-[0px_18px_24px_-20px_rgba(0,0,0,0.13),0px_2px_0px_0px_#FFF_inset,0px_8px_16px_-12px_rgba(0,0,0,0.08)] rounded-2xl">
        <button className="absolute top-2 right-2 flex justify-center items-center size-5 bg-gradient-to-b from-[#323232] to-[#121212] rounded-full cursor-pointer">
          <svg
            className="size-3 fill-white"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M5.382 5.382c.509-.509 1.335-.509 1.845 0L10 8.155l2.773-2.773c.463-.463 1.188-.505 1.698-.126l.146.126c.509.509.509 1.335 0 1.845L11.843 10l2.774 2.773c.463.463.505 1.188.126 1.698l-.126.146c-.509.509-1.335.509-1.845 0L10 11.843l-2.773 2.774c-.463.463-1.188.505-1.698.126l-.146-.126c-.509-.509-.509-1.335 0-1.845L8.155 10 5.382 7.227c-.463-.463-.505-1.188-.126-1.698l.126-.146" />
          </svg>
        </button>
        <div className="">
          {comments.map((comment, index) => (
            <Message item={comment} key={index} />
          ))}
        </div>
        <NewMessage />
      </div>
    </div>
  );
}

export default Comment;
