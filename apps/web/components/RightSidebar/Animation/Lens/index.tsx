import { useState } from "react";
import Select from "@/components/Select";
import Icon from "@/components/Icon";
import Group from "../../Group";

import { lensFormats, zoomLevels, rotates } from "./content";

const Lens = () => {
  const [lensFormat, setLensFormat] = useState(lensFormats[0]);
  const [zoomLevel, setZoomLevel] = useState(zoomLevels[0]);
  const [rotate, setRotate] = useState(rotates[0]);
  return (
    <Group title="Lens">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Select
            className="grow"
            icon="camera-1"
            value={lensFormat}
            onChange={setLensFormat}
            options={lensFormats}
            isMedium
            isWhite
          />
          <button className="btn-icon size-6">
            <Icon className="!size-4" name="show-view" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            className="grow"
            icon="focus-letter"
            value={zoomLevel}
            onChange={setZoomLevel}
            options={zoomLevels}
            isMedium
          />
          <button className="btn-icon size-6">
            <Icon className="!size-4" name="minus" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            className="grow"
            icon="focus-letter"
            value={rotate}
            onChange={setRotate}
            options={rotates}
            isMedium
          />
          <button className="btn-icon size-6">
            <Icon className="!size-4" name="minus" />
          </button>
        </div>
      </div>
    </Group>
  );
};

export default Lens;
