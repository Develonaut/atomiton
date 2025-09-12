import { useState } from "react";
import Select from "@/components/Select";
import Icon from "@/components/Icon";
import Group from "../../Group";
import { NumberInput } from "@/components/form";

function Artboard() {
  const xPostOptions = [
    { id: 0, name: "800x600" },
    { id: 1, name: "1024x768" },
    { id: 2, name: "1280x1024" },
    { id: 3, name: "1600x1200" },
    { id: 4, name: "1920x1080" },
  ];

  const [xPost, setXPost] = useState(xPostOptions[0]);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  return (
    <Group title="Artboard">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Select
            className="grow"
            label="X Post"
            icon="camera-1"
            value={xPost}
            onChange={setXPost}
            options={xPostOptions}
            isMedium
            isWhite
          />
          <button className="btn-icon size-6">
            <Icon className="!size-4" name="lock" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <NumberInput
              className="flex-1"
              value={width}
              onChange={setWidth}
              prefix="W"
            />
            <NumberInput
              className="flex-1"
              value={height}
              onChange={setHeight}
              prefix="H"
            />
          </div>
          <div className="shrink-0 w-6 text-center text-secondary">px</div>
        </div>
      </div>
    </Group>
  );
}

export default Artboard;
