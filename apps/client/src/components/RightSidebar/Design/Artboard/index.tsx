import { useState } from "react";
import Select from "@/components/Select";
import Icon from "@/components/Icon";
import Group from "../../Group";

const Artboard = () => {
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
            <div className="relative flex-1">
              <div className="absolute top-[52%] left-2.5 -translate-y-1/2 text-body-md pointer-events-none text-secondary/50">
                W
              </div>
              <input
                className="w-full h-9 pl-7.5 pr-2 border border-surface-03 bg-surface-03 rounded-[0.625rem] text-body-md text-primary outline-0 transition-colors focus:border-s-02 focus:bg-surface-02"
                type="text"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute top-[52%] left-2.5 -translate-y-1/2 text-body-md pointer-events-none text-secondary/50">
                H
              </div>
              <input
                className="w-full h-9 pl-7.5 pr-2 border border-surface-03 bg-surface-03 rounded-[0.625rem] text-body-md text-primary outline-0 transition-colors focus:border-s-02 focus:bg-surface-02"
                type="text"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="shrink-0 w-6 text-center text-secondary">px</div>
        </div>
      </div>
    </Group>
  );
};

export default Artboard;
