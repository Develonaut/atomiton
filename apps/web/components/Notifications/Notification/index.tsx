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
  onClick: () => void;
};

const Notification = ({ item, onClick }: Props) => (
  <div className="relative flex items-start p-5 pr-4 border-t border-s-01 first:border-t-0">
    <div className="absolute inset-0 z-1 cursor-pointer" onClick={onClick} />
    <div className="relative shrink-0">
      <Image
        className="size-12 rounded-full opacity-100"
        src={item.avatar}
        width={48}
        height={48}
        alt="Avatar"
      />
      <div
        className={`absolute -right-1 -bottom-1 flex justify-center items-center size-5.5 rounded-full border-2 border-surface-01 ${
          item.type === "image"
            ? "bg-[#AD9000]"
            : item.type === "invite"
              ? "bg-green"
              : item.type === "like"
                ? "bg-red"
                : item.type === "video"
                  ? "bg-[#1BA4F3]"
                  : "bg-[#8651F8]"
        }`}
      >
        <Image
          className="size-3 opacity-100"
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
      <div className="relative mb-2 pr-4">
        <span className="text-body-lg-str">{item.title}</span>
        <span className="ml-1 text-secondary/50">{item.time}</span>
        {item.new && (
          <span className="absolute top-1 right-0 size-2 rounded-full bg-green" />
        )}
      </div>
      <div className="truncate text-body-lg">
        {item.type === "comment" && (
          <>
            Commented <span className="text-secondary">on</span>{" "}
            <span className="font-semibold">{item.details}</span>
          </>
        )}
        {(item.type === "image" || item.type === "video") && item.details}
        {item.type === "invite" && (
          <>
            Invited <span className="text-secondary">you to edit</span>{" "}
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
        <div className="mt-2 line-clamp-2 text-p-sm text-secondary/80">
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

export default Notification;
