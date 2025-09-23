import { useId } from "react";
import { Tooltip } from "react-tooltip";
import Image from "#components/Image";
import Icon from "#components/Icon";

import { images } from "./content";

function Images() {
  const idTooltip = useId();

  return (
    <div className="flex flex-wrap gap-3 mb-10 max-md:mb-8">
      <div className="flex justify-center items-center size-15 rounded-[0.625rem] bg-surface-03 border border-s-01 text-secondary">
        3:4
      </div>
      {images.map((image) => (
        <div
          className="group relative flex justify-center items-center size-15 rounded-[0.625rem] bg-surface-03 border border-s-01 overflow-hidden transition-colors hover:border-[#C4C4C4] hover:bg-surface-01"
          key={image.id}
        >
          <Image
            className={image.fullSize ? "size-full object-cover" : "size-11"}
            src={image.src}
            width={image.fullSize ? 60 : 44}
            height={image.fullSize ? 60 : 44}
            alt=""
          />
          <button
            className="absolute top-0.5 right-0.5 z-2 size-4 rounded-full bg-gradient-to-b from-[#484848] to-shade-09 text-0 opacity-0 transition-opacity group-hover:opacity-100"
            data-tooltip-id={idTooltip}
            data-tooltip-content="Add to assets"
            data-tooltip-place="top"
          >
            <Icon name="plus" className="!size-3 fill-white" />
          </button>
        </div>
      ))}
      <Tooltip id={idTooltip} />
    </div>
  );
}

export default Images;
