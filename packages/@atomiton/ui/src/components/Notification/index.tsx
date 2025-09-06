import Image from "@/components/Image";
import Button from "@/components/Button";

type Props = {
  item: {
    id: number;
    title: string;
    time: string;
    type: string;
    avatar: string;
    details: string;
    content?: string;
    new: boolean;
  };
};

function Notification({ item }: Props) {
  return (
    <div className="relative flex items-start p-5 pr-4 border-t border-[#ECECEC] first:border-t-0">
      <div className="absolute inset-0 z-1 cursor-pointer" onClick={() => {}} />
      <div className="relative shrink-0">
        <Image
          className="size-12 rounded-full"
          src={item.avatar}
          width={48}
          height={48}
          alt="Avatar"
        />
        <div
          className={`absolute -right-1 -bottom-1 flex justify-center items-center size-5.5 rounded-full border-2 border-[#FCFCFC] ${
            item.type === "image"
              ? "bg-[#AD9000]"
              : item.type === "invite"
                ? "bg-[#55b93e]"
                : item.type === "like"
                  ? "bg-[#fe5938]"
                  : item.type === "video"
                    ? "bg-[#1BA4F3]"
                    : "bg-[#8651F8]"
          }`}
        >
          <Image
            className="size-3"
            src={
              item.type === "image"
                ? "/images/notifications/image.svg"
                : item.type === "invite"
                  ? "/images/notifications/invite.svg"
                  : item.type === "like"
                    ? "/images/notifications/like.svg"
                    : item.type === "video"
                      ? "/images/notifications/video.svg"
                      : "/images/notifications/comment.svg"
            }
            width={12}
            height={12}
            alt="Icon"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center w-[calc(100%-3rem)] min-h-12 pl-4">
        <div className="relative -mt-0.5 mb-1.5 pr-4">
          <span className="text-[0.8125rem] leading-[1rem] font-semibold">
            {item.title}
          </span>
          <span className="ml-1 text-[0.75rem] leading-[1rem] font-medium text-[#7B7B7B]/50">
            {item.time}
          </span>
          {item.new && (
            <span className="absolute top-2.5 right-0 size-2 rounded-full bg-[#55b93e]" />
          )}
        </div>
        <div className="truncate text-[0.8125rem] leading-[1rem]">
          {item.type === "comment" && (
            <>
              Commented <span className="text-[#7B7B7B]">on</span>{" "}
              <span className="font-semibold">{item.details}</span>
            </>
          )}
          {(item.type === "image" || item.type === "video") && item.details}
          {item.type === "invite" && (
            <>
              Invited <span className="text-[#7B7B7B]">you to edit</span>{" "}
              <span className="font-semibold">{item.details}</span>
            </>
          )}
          {item.type === "like" && (
            <>
              Liked <span className="font-semibold">{item.details}</span>
            </>
          )}
        </div>
        {item.content && (
          <div className="mt-2 line-clamp-2 text-[0.8125rem] leading-[1.2188rem] text-[#7B7B7B]/80">
            {item.content}
          </div>
        )}
        {item.type === "invite" && (
          <div className="relative z-3 flex gap-2 mt-4">
            <Button className="!h-9 !px-5" isPrimary>
              Decline
            </Button>
            <Button className="!h-9 !px-5" isSecondary>
              Accept
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;
