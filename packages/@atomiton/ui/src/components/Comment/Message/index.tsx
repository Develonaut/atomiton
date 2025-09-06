import Image from "@/components/Image";

type Props = {
  item: {
    name: string;
    content: React.ReactNode;
    time: string;
    avatar: string;
  };
};

const Message = ({ item }: Props) => (
  <div className="flex gap-4 p-4 border-b border-[#ECECEC]">
    <div className="shrink-0">
      <Image
        className="size-8 rounded-full"
        src={item.avatar}
        width={32}
        height={32}
        alt="Avatar"
      />
    </div>
    <div className="grow">
      <div className="text-[0.75rem] leading-[1rem] font-medium">
        {item.name}
        <span className="ml-2 text-[0.6875rem] text-[#7B7B7B]">
          {item.time}
        </span>
      </div>
      <div className="mt-1 text-[0.8125rem] leading-[1.22rem] [&_span]:text-[#3582FF]">
        {item.content}
      </div>
    </div>
  </div>
);

export default Message;
