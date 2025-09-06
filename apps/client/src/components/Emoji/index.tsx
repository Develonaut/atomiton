import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import type { EmojiClickData } from "emoji-picker-react";
import EmojiPicker, { Theme, Categories } from "emoji-picker-react";
import Icon from "@/components/Icon";

type EmojiType = {
  classButton?: string;
  classMenuItems?: string;
  onEmojiClick: (emoji: EmojiClickData) => void;
};

function Emoji({ classButton, classMenuItems, onEmojiClick }: EmojiType) {
  return (
    <Popover>
      <PopoverButton className={`text-0 outline-0 ${classButton || ""}`}>
        <Icon className="fill-inherit" name="emoji" />
      </PopoverButton>
      <PopoverPanel
        className={`headlessui-dropdown z-100 w-80 h-44.5 origin-top transition rounded-xl shadow-popover duration-200 ease-out outline-0 data-[closed]:scale-95 data-[closed]:opacity-0 ${
          classMenuItems || ""
        }`}
        anchor="bottom start"
        transition
        modal={false}
      >
        <EmojiPicker
          className="!w-full !h-full !rounded-2xl"
          onEmojiClick={onEmojiClick}
          autoFocusSearch={false}
          searchDisabled={true}
          skinTonesDisabled={true}
          previewConfig={{ showPreview: false }}
          theme={Theme.LIGHT}
          lazyLoadEmojis={true}
          categories={[
            {
              category: Categories.SMILEYS_PEOPLE,
              name: "People",
            },
          ]}
        />
      </PopoverPanel>
    </Popover>
  );
}

export default Emoji;
