import { useState, useId } from "react";
import { Tooltip } from "react-tooltip";
import Image from "@/components/Image";
import Select from "@/components/Select";
import Icon from "@/components/Icon";

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

function Person({ name, email, avatar, accessPerson, isRemoveButton }: Props) {
  const idTooltip = useId();
  const [access, setAccess] = useState(
    accesses[accessPerson === "view" ? 0 : 1] || accesses[0] || null,
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
        <div>{name}</div>
        <div className="text-body-sm text-secondary">{email}</div>
      </div>
      {accessPerson === "owner" ? (
        <div className="flex justify-between items-center min-w-22 px-2">
          Owner
          <Icon className="!size-4 fill-green" name="shield" />
        </div>
      ) : (
        <Select
          className="min-w-22"
          classButton="!h-8 !px-2 !rounded-lg !border-transparent !bg-transparent"
          value={access}
          onChange={setAccess}
          options={accesses}
          isMedium
        />
      )}
      {isRemoveButton && (
        <button
          className="absolute top-0 right-0 bottom-0 w-5.5 bg-red rounded-l-lg opacity-0 transition-opacity group-hover:opacity-100"
          data-tooltip-id={idTooltip}
          data-tooltip-content="Remove"
          data-tooltip-place="right"
        >
          <Icon className="!size-3.5 fill-shade-01" name="close-thick" />
        </button>
      )}
      <Tooltip id={idTooltip} />
    </div>
  );
}

export default Person;
