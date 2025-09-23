import {
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import Notifications from "#components/Notifications";

function NotificationsDropdown() {
  const isNewNotification = true;

  return (
    <Popover className="">
      <PopoverButton
        className={`relative z-20 flex justify-center items-center size-10 rounded-xl border border-transparent transition-all outline-0 cursor-pointer hover:bg-[#f1f1f1] data-open:bg-[#f1f1f1] data-open:border-[#e2e2e2] data-open:shadow-[0_-1px_3px_0px_rgba(18,18,18,0.15)_inset,0px_1.25px_1px_0px_#FFF_inset] ${
          isNewNotification
            ? "after:absolute after:top-1 after:right-1 after:size-1 after:bg-[#fe5938] after:rounded-full"
            : ""
        }`}
      >
        <svg
          className="size-5 fill-primary"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M9.149 1.683c.852-1.272 2.787-.651 2.787.894v3.749l4.033.001c1.18 0 1.896 1.307 1.338 2.335l-.08.132-6.376 9.522c-.852 1.272-2.787.651-2.787-.894l-.001-3.751-4.032.001c-1.18 0-1.896-1.307-1.338-2.336l.08-.132 6.376-9.522zm.952 1.904l-5.489 8.196 3.757.001c.791 0 1.442.619 1.521 1.413l.008.161-.001 3.053 5.489-8.196-3.756.001c-.791 0-1.442-.619-1.521-1.413l-.008-.161V3.587z" />
        </svg>
      </PopoverButton>
      <PopoverBackdrop
        className="fixed inset-0 z-15 bg-[#323232]/40 transition duration-100 ease-out data-closed:opacity-0"
        transition
      />
      <PopoverPanel
        className="z-20 top-full right-5 !left-auto bottom-5 w-96 h-[calc(100vh-6.25rem)] mt-5 flex origin-top bg-[#fcfcfc] border border-[#ececec] rounded-[1.25rem] shadow-2xl transition outline-0 !overflow-visible data-closed:opacity-0"
        anchor="bottom"
        transition
        modal={true}
      >
        <Notifications className="flex flex-col h-full" />
      </PopoverPanel>
    </Popover>
  );
}

export default NotificationsDropdown;
