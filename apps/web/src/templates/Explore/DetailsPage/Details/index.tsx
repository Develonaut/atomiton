import { useId } from "react";
import { Tooltip } from "react-tooltip";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Images from "./Images";

const Details = () => {
  const idTooltip = useId();

  const actions = [
    {
      icon: "copy",
      onClick: () => {},
      tooltip: "Copy prompt",
    },
    {
      icon: "edit",
      onClick: () => {},
      tooltip: "Edit prompt",
    },
    {
      icon: "like",
      onClick: () => {},
      tooltip: "Like",
    },
    {
      icon: "dislike",
      onClick: () => {},
      tooltip: "Dislike",
    },
  ];

  return (
    <div className="flex flex-col shrink-0 w-160 min-h-[calc(100svh-5rem)] p-15 border-l border-s-01 max-[1940px]:w-124 max-xl:w-100 max-xl:p-8 max-lg:w-full max-lg:min-h-auto max-lg:px-5">
      <div className="mb-3 text-h2 max-md:text-h3">Mirror Gate v1.0</div>
      <div className="flex gap-5 mb-10 max-md:mb-8">
        <div className="flex items-center gap-2">
          <div className="">
            <Image
              className="size-5 rounded-full opacity-100"
              src="/images/avatars/2.png"
              width={20}
              height={20}
              alt=""
            />
          </div>
          <div className="text-body-md-str">randomdash</div>
        </div>
        <div className="flex items-center gap-1.5 text-secondary">
          <Icon className="!size-4 fill-secondary/70" name="clock" />3 Jun, 2025
        </div>
      </div>
      <Images />
      <div className="mt-auto line-clamp-3 text-p-sm">
        <Icon className="!size-4 -mt-0.5 fill-green" name="flash" />{" "}
        <span className="text-secondary">Prompt:</span> A surreal landscape
        featuring a tall, thin monolithic mirror standing upright in the middle
        of gently rolling grassy hills during golden hour. The mirror is highly
        reflective and seamlessly blends with the environment, reflecting the
        sky and the horizon, creating an illusion of transparency. The lighting
        is warm and soft, casting long shadows across the terrain. The grass is
        dry and textured, with a clear dirt path leading toward the monolith.
        The sky is clear with a gradient from soft blue to light orange near the
        horizon. The atmosphere is calm, cinematic, and contemplative. Shot in
        ultra-high resolution with a realistic, slightly stylized rendering
        similar to a high-end 3D render or fine art photograph.
      </div>
      <div className="flex gap-2 mt-3">
        {actions.map((action) => (
          <button
            className="group size-6 rounded-lg transition-colors hover:bg-surface-03"
            key={action.icon}
            data-tooltip-id={idTooltip}
            data-tooltip-content={action.tooltip}
            data-tooltip-place="top"
          >
            <Icon
              className="!size-4 fill-secondary/70 transition-colors group-hover:fill-primary/60"
              name={action.icon}
            />
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-8">
        <Button className="flex-1 !h-9.5" isPrimary>
          Download
        </Button>
        <Button className="flex-1 !h-9.5" isSecondary>
          Remix
        </Button>
      </div>
      <Tooltip id={idTooltip} />
    </div>
  );
};

export default Details;
