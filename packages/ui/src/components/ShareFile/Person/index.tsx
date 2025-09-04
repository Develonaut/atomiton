import { useState } from "react";
import Image from "@/components/Image";
import Select from "@/components/Select";

type Props = {
  name: string;
  email: string;
  avatar: string;
  accessPerson: string;
  isRemoveButton?: boolean;
};

const accesses = [
  { id: 0, name: "can view" },
  { id: 1, name: "can edit" },
];

const Person = ({
  name,
  email,
  avatar,
  accessPerson,
  isRemoveButton,
}: Props) => {
  const [access, setAccess] = useState(
    accesses[accessPerson === "view" ? 0 : 1],
  );

  return (
    <div className="group relative flex items-center gap-3 px-4 py-2.5">
      <div className="shrink-0">
        <Image
          className="size-8 rounded-full opacity-100"
          src={avatar}
          width={32}
          height={32}
          alt=""
        />
      </div>
      <div className="mr-auto">
        <div className="text-[0.75rem] leading-[1rem] font-medium text-[#121212]">
          {name}
        </div>
        <div className="text-[0.6875rem] leading-[1rem] text-[#7B7B7B]">
          {email}
        </div>
      </div>
      {accessPerson === "owner" ? (
        <div className="flex justify-between items-center min-w-22 px-2 text-[0.75rem] leading-[1rem] font-medium text-[#121212]">
          Owner
          <svg
            className="size-4 fill-[#49BA61]"
            width={16}
            height={16}
            viewBox="0 0 16 16"
          >
            <path
              d="M11.12 2.7a1.75 1.75 0 0 1 1.75 1.75v5.406a1.75 1.75 0 0 1-.912 1.536l-3.125 1.705a1.75 1.75 0 0 1-1.676 0l-3.125-1.705a1.75 1.75 0 0 1-.912-1.536V4.45A1.75 1.75 0 0 1 4.87 2.7h6.25zm0 1.5H4.87a.25.25 0 0 0-.25.25v5.406a.25.25 0 0 0 .13.219l3.125 1.704a.25.25 0 0 0 .239 0l3.125-1.704a.25.25 0 0 0 .13-.22V4.45a.25.25 0 0 0-.25-.25zM8.715 6.17A.75.75 0 0 1 9.775 7.23l-1.75 1.75a.75.75 0 0 1-1.061 0l-.75-.75A.75.75 0 1 1 7.275 7.17l.22.219 1.22-1.219z"
              fill="#49BA61"
            />
          </svg>
        </div>
      ) : (
        <Select
          className="min-w-22"
          classButton=""
          value={access}
          onChange={setAccess}
          options={accesses}
          isMinimal
          isSmall
        />
      )}
      {isRemoveButton && (
        <button className="absolute top-0 right-0 bottom-0 flex justify-center items-center w-5.5 bg-[#FE5938] rounded-l-lg opacity-0 cursor-pointer transition-opacity group-hover:opacity-100">
          <svg
            className="size-3.5 fill-[#fcfcfc]"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M5.382 5.382c.509-.509 1.335-.509 1.845 0L10 8.155l2.773-2.773c.463-.463 1.188-.505 1.698-.126l.146.126c.509.509.509 1.335 0 1.845L11.843 10l2.774 2.773c.463.463.505 1.188.126 1.698l-.126.146c-.509.509-1.335.509-1.845 0L10 11.843l-2.773 2.774c-.463.463-1.188.505-1.698.126l-.146-.126c-.509-.509-.509-1.335 0-1.845L8.155 10 5.382 7.227c-.463-.463-.505-1.188-.126-1.698l.126-.146z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Person;
