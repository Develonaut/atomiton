import Image from "@/components/Image";

type Props = {
  item: {
    id: number;
    name: string;
    content: React.ReactNode;
    time: string;
    avatar: string;
  };
};

function Message({ item }: Props) {
  return (
    <div className="flex gap-4 p-4 border-b border-s-01">
      <div className="shrink-0">
        <Image
          className="size-8 rounded-full opacity-100"
          src={item.avatar}
          width={32}
          height={32}
          alt="Avatar"
        />
      </div>
      <div className="grow">
        <div className="">
          {item.name}
          <span className="ml-2 text-body-sm text-secondary">{item.time}</span>
        </div>
        <div className="mt-1 text-p-sm [&_span]:text-blue">{item.content}</div>
      </div>
    </div>
  );
}

export default Message;
