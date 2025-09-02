import { useId, useState } from "react";
import Link from "@/router/Link";
import NextImage from "next/image";
import { Tooltip } from "react-tooltip";
import Icon from "@/components/Icon";

type Props = {
  value: {
    id: number;
    title: string;
    image: string;
  };
};

const Item = ({ value }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const idTooltip = useId();

  const actions = [
    {
      icon: "text",
      onClick: () => {},
      tooltip: "Edit",
    },
    {
      icon: "repeat",
      onClick: () => {},
      tooltip: "Remix",
    },
    {
      icon: "heart",
      onClick: () => {},
      tooltip: "Like",
    },
  ];
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl opacity-0 transition-opacity ${
        loaded && "opacity-100"
      }`}
    >
      <Link href="/explore/details">
        <NextImage
          src={value.image}
          className="inline-block align-top w-full h-auto"
          width={366}
          height={0}
          onLoad={() => setLoaded(true)}
          alt={value.title}
        />
      </Link>
      <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-[#171717]/100 to-[#171717]/0 opacity-0 transition-opacity pointer-events-none group-hover:opacity-45 max-[1179px]:opacity-45"></div>
      <div className="absolute left-0 right-0 bottom-0 z-2 flex items-center p-3 opacity-0 transition-opacity group-hover:opacity-100 max-[1179px]:opacity-100">
        <div className="relative z-1 mr-auto p-2.5 text-body-md-str text-shade-01">
          {value.title}
        </div>
        <div className="relative z-1 flex gap-1 shrink-0">
          {actions.map((action, index) => (
            <button
              className="size-9 border border-transparent rounded-[0.625rem] transition-colors hover:bg-shade-01/15 hover:border-shade-01/25"
              key={index}
              data-tooltip-id={idTooltip}
              data-tooltip-content={action.tooltip}
              data-tooltip-place="top"
            >
              <Icon className="!size-4 fill-shade-01" name={action.icon} />
            </button>
          ))}
        </div>
      </div>
      <Tooltip id={idTooltip} />
    </div>
  );
};

export default Item;
