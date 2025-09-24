import { useState } from "react";
import type { SelectOption } from "#components/Select";
import Select from "#components/Select";
import Group from "#components/../Group";

function Artboard() {
  const xPostOptions = [
    { id: 0, name: "800x600" },
    { id: 1, name: "1024x768" },
    { id: 2, name: "1280x1024" },
    { id: 3, name: "1600x1200" },
    { id: 4, name: "1920x1080" },
  ];

  const [xPost, setXPost] = useState<SelectOption | null>(
    xPostOptions[0] ?? null,
  );

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  return (
    <Group title="Artboard">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Select
            className="grow"
            label="X Post"
            value={xPost}
            onChange={setXPost}
            options={xPostOptions}
            isWhite
            icon={
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path d="M15.94 2c1.414 0 2.56 1.194 2.56 2.667v10.667c0 1.473-1.146 2.667-2.56 2.667H4.06c-1.414 0-2.56-1.194-2.56-2.667V4.667C1.5 3.194 2.646 2 4.06 2h11.88zm0 1.92H4.06c-.396 0-.717.334-.717.747v10.667c0 .412.321.747.717.747h11.88c.396 0 .717-.334.717-.747V4.667c0-.412-.321-.747-.717-.747zM10 6.267c1.98 0 3.584 1.671 3.584 3.733S11.98 13.733 10 13.733 6.416 12.062 6.416 10 8.02 6.267 10 6.267zm0 1.92c-.962 0-1.741.812-1.741 1.813s.779 1.813 1.741 1.813 1.741-.812 1.741-1.813S10.962 8.187 10 8.187zm4.506-3.093c.566 0 1.024.478 1.024 1.067s-.459 1.067-1.024 1.067-1.024-.478-1.024-1.067.459-1.067 1.024-1.067z" />
              </svg>
            }
          />
          <button className="flex justify-center items-center size-6 shrink-0 rounded-md fill-[#7B7B7B] transition-colors cursor-pointer hover:bg-[#F1F1F1] hover:fill-[#121212]">
            <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
              <path d="M10 1.5c2.481 0 4.493 1.996 4.493 4.457L14.492 7.1l.083.004c1.294.091 2.328 1.116 2.419 2.4l.007.185v6.219c0 1.431-1.169 2.592-2.612 2.592H5.612C4.169 18.5 3 17.34 3 15.908V9.689c0-1.431 1.169-2.591 2.612-2.591l-.104.002V5.957c0-2.382 1.884-4.328 4.254-4.451L10 1.5zm4.388 7.463H5.612a.73.73 0 0 0-.731.726v6.219a.73.73 0 0 0 .731.726h8.776a.73.73 0 0 0 .731-.726V9.689a.73.73 0 0 0-.731-.726zM10 10.622c.519 0 .94.418.94.933v2.488c0 .515-.421.933-.94.933s-.94-.418-.94-.933v-2.488c0-.515.421-.933.94-.933zm0-7.256c-1.443 0-2.612 1.16-2.612 2.591v1.139h5.223l.001-1.139a2.6 2.6 0 0 0-2.425-2.585L10 3.366z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <div className="absolute top-[52%] left-2.5 -translate-y-1/2 text-[0.75rem] font-medium text-[#7B7B7B]/50 pointer-events-none">
                W
              </div>
              <input
                className="w-full h-9 pl-7.5 pr-2 border border-[#F1F1F1] bg-[#F1F1F1] rounded-[0.625rem] text-[0.75rem] font-medium text-[#121212] transition-colors focus:border-[#e2e2e2] focus:bg-[#f8f7f7]"
                type="text"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute top-[52%] left-2.5 -translate-y-1/2 text-[0.75rem] font-medium text-[#7B7B7B]/50 pointer-events-none">
                H
              </div>
              <input
                className="w-full h-9 pl-7.5 pr-2 border border-[#F1F1F1] bg-[#F1F1F1] rounded-[0.625rem] text-[0.75rem] font-medium text-[#121212] transition-colors focus:border-[#e2e2e2] focus:bg-[#f8f7f7]"
                type="text"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="shrink-0 w-6 text-center text-[0.75rem] font-medium text-[#7B7B7B]">
            px
          </div>
        </div>
      </div>
    </Group>
  );
}

export default Artboard;
