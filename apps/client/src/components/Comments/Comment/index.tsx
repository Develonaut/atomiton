import {
  Popover,
  PopoverButton,
  PopoverPanel,
  CloseButton,
} from "@headlessui/react";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Message from "./Message";
import NewMessage from "./NewMessage";

import { comments } from "./comments";

type Props = {
  isRead: boolean;
};

const Comment = ({ isRead }: Props) => (
  <div
    className="absolute z-10 cursor-default"
    style={{ left: "30%", top: "40%" }}
  >
    <Popover>
      <PopoverButton
        className={`flex p-0.25 bg-surface-01 border-[1.5px] rounded-full rounded-bl-none shadow-[0px_2px_2px_0px_rgba(0,0,0,0.15)] cursor-pointer ${
          isRead ? "border-s-01" : "border-blue"
        }`}
        as="div"
      >
        {["/images/avatars/3.png", "/images/avatars/6.png"].map(
          (image, index) => (
            <div
              className="-ml-2.5 border-[1.5px] border-surface-01 rounded-full first:ml-0"
              key={index}
            >
              <Image
                className="size-6 rounded-full opacity-100"
                src={image}
                width={24}
                height={24}
                alt="Avatar"
              />
            </div>
          ),
        )}
      </PopoverButton>
      <PopoverPanel
        className="new-comment z-50 [--anchor-gap:0.75rem] w-70 bg-surface-01 border border-s-01 shadow-popover rounded-2xl transition duration-200 data-closed:opacity-0"
        anchor="right start"
        transition
        modal={false}
      >
        <CloseButton
          className="absolute top-2 right-2 size-5 bg-gradient-to-b from-shade-07 to-shade-09 rounded-full text-0"
          as="button"
        >
          <Icon className="!size-3 fill-white" name="close-thick" />
        </CloseButton>
        <div className="">
          {comments.map((comment) => (
            <Message item={comment} key={comment.id} />
          ))}
        </div>
        <NewMessage />
      </PopoverPanel>
    </Popover>
  </div>
);

export default Comment;
