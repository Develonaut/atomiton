import Image from "@/components/Image";

type Props = {
  avatars: string[];
  isRead?: boolean;
};

const CommentPin = ({ avatars, isRead }: Props) => (
  <div
    className={`flex p-0.25 bg-[#FCFCFC] border-[1.5px] rounded-full rounded-bl-none shadow-[0px_2px_2px_0px_rgba(0,0,0,0.15)] cursor-pointer ${
      isRead ? "border-[#ECECEC]" : "border-[#3582FF]"
    }`}
  >
    {avatars.map((avatar, index) => (
      <div
        className="-ml-2.5 border-[1.5px] border-[#FCFCFC] rounded-full first:ml-0"
        key={index}
      >
        <Image
          className="size-6 rounded-full opacity-100"
          src={avatar}
          width={24}
          height={24}
          alt="Avatar"
        />
      </div>
    ))}
  </div>
);

export default CommentPin;
