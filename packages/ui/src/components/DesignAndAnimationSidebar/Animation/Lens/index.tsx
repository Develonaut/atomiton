import { useState } from "react";
import Select from "@/components/Select";
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
            value={lensFormat}
            onChange={setLensFormat}
            options={lensFormats}
            isWhite
            icon={
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path d="M15.94 2c1.414 0 2.56 1.194 2.56 2.667v10.667c0 1.473-1.146 2.667-2.56 2.667H4.06c-1.414 0-2.56-1.194-2.56-2.667V4.667C1.5 3.194 2.646 2 4.06 2h11.88zm0 1.92H4.06c-.396 0-.717.334-.717.747v10.667c0 .412.321.747.717.747h11.88c.396 0 .717-.334.717-.747V4.667c0-.412-.321-.747-.717-.747zM10 6.267c1.98 0 3.584 1.671 3.584 3.733S11.98 13.733 10 13.733 6.416 12.062 6.416 10 8.02 6.267 10 6.267zm0 1.92c-.962 0-1.741.812-1.741 1.813s.779 1.813 1.741 1.813 1.741-.812 1.741-1.813S10.962 8.187 10 8.187zm4.506-3.093c.566 0 1.024.478 1.024 1.067s-.459 1.067-1.024 1.067-1.024-.478-1.024-1.067.459-1.067 1.024-1.067z" />
              </svg>
            }
          />
          <button className="flex justify-center items-center size-6 shrink-0 rounded-md fill-[#7B7B7B] transition-colors cursor-pointer hover:bg-[#F1F1F1]">
            <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
              <path d="M2.123 9.263l-.808-.466h0l.808.466zm15.754 0l.808-.466h0l-.808.466zM2.123 10.736l-.808.466h0l.808-.466zm15.754 0l.808.466h0l-.808-.466zM2.123 9.263l.808.466C4.802 6.409 7.463 4.881 10 4.881s5.198 1.529 7.069 4.848l.808-.466.808-.466C16.556 5.02 13.34 3 10 3S3.444 5.02 1.315 8.798l.808.466zm0 1.473l-.808.466C3.444 14.98 6.66 17 10 17s6.556-2.02 8.685-5.798l-.808-.466-.808-.466c-1.871 3.32-4.532 4.848-7.069 4.848s-5.198-1.529-7.069-4.848l-.808.466zm0-1.473l-.808-.466a2.45 2.45 0 0 0 0 2.404l.808-.466.808-.466a.55.55 0 0 1 0-.542l-.808-.466zm15.754 0l-.808.466a.55.55 0 0 1 0 .542l.808.466.808.466a2.45 2.45 0 0 0 0-2.404l-.808.466zM12.686 10h-.93c0 .981-.786 1.776-1.756 1.776v.94.94c1.997 0 3.616-1.637 3.616-3.657h-.93zM10 12.716v-.94c-.97 0-1.756-.795-1.756-1.776h-.93-.93c0 2.02 1.619 3.657 3.616 3.657v-.94zM7.314 10h.93c0-.981.786-1.776 1.756-1.776v-.94-.94C8.003 6.343 6.384 7.98 6.384 10h.93zM10 7.284v.94c.97 0 1.756.795 1.756 1.776h.93.93c0-2.02-1.619-3.657-3.616-3.657v.94z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            className="grow"
            value={zoomLevel}
            onChange={setZoomLevel}
            options={zoomLevels}
            icon={
              <svg
                className="size-5"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M2.96 12.453a.96.96 0 0 1 .96.96v1.92c0 .412.334.747.747.747h1.92a.96.96 0 1 1 0 1.92h-1.92C3.194 18 2 16.806 2 15.333v-1.92a.96.96 0 0 1 .96-.96zm14.08 0a.96.96 0 0 1 .96.96v1.92C18 16.806 16.806 18 15.333 18h-1.92a.96.96 0 1 1 0-1.92h1.92c.412 0 .747-.334.747-.747v-1.92a.96.96 0 0 1 .96-.96zM9.126 7.043a.96.96 0 0 1 1.748 0l1.707 3.755.64 1.408a.96.96 0 1 1-1.748.795l-.385-.846H8.911L8.527 13a.96.96 0 0 1-1.149.523l-.122-.046a.96.96 0 0 1-.477-1.271l.64-1.408 1.707-3.755zM6.587 2a.96.96 0 1 1 0 1.92h-1.92c-.412 0-.747.334-.747.747v1.92a.96.96 0 1 1-1.92 0v-1.92C2 3.194 3.194 2 4.667 2h1.92zm8.747 0C16.806 2 18 3.194 18 4.667v1.92a.96.96 0 1 1-1.92 0v-1.92c0-.412-.334-.747-.747-.747h-1.92a.96.96 0 1 1 0-1.92h1.92z" />
              </svg>
            }
          />
          <button className="flex justify-center items-center size-6 shrink-0 rounded-md fill-[#7B7B7B] transition-colors cursor-pointer hover:bg-[#F1F1F1]">
            <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
              <path d="M15.053 9c.523 0 .947.448.947 1s-.424 1-.947 1H4.947C4.424 11 4 10.552 4 10s.424-1 .947-1h10.105z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            className="grow"
            value={rotate}
            onChange={setRotate}
            options={rotates}
            icon={
              <svg
                className="size-5"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M2.96 12.453a.96.96 0 0 1 .96.96v1.92c0 .412.334.747.747.747h1.92a.96.96 0 1 1 0 1.92h-1.92C3.194 18 2 16.806 2 15.333v-1.92a.96.96 0 0 1 .96-.96zm14.08 0a.96.96 0 0 1 .96.96v1.92C18 16.806 16.806 18 15.333 18h-1.92a.96.96 0 1 1 0-1.92h1.92c.412 0 .747-.334.747-.747v-1.92a.96.96 0 0 1 .96-.96zM9.126 7.043a.96.96 0 0 1 1.748 0l1.707 3.755.64 1.408a.96.96 0 1 1-1.748.795l-.385-.846H8.911L8.527 13a.96.96 0 0 1-1.149.523l-.122-.046a.96.96 0 0 1-.477-1.271l.64-1.408 1.707-3.755zM6.587 2a.96.96 0 1 1 0 1.92h-1.92c-.412 0-.747.334-.747.747v1.92a.96.96 0 1 1-1.92 0v-1.92C2 3.194 3.194 2 4.667 2h1.92zm8.747 0C16.806 2 18 3.194 18 4.667v1.92a.96.96 0 1 1-1.92 0v-1.92c0-.412-.334-.747-.747-.747h-1.92a.96.96 0 1 1 0-1.92h1.92z" />
              </svg>
            }
          />
          <button className="flex justify-center items-center size-6 shrink-0 rounded-md fill-[#7B7B7B] transition-colors cursor-pointer hover:bg-[#F1F1F1]">
            <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
              <path d="M15.053 9c.523 0 .947.448.947 1s-.424 1-.947 1H4.947C4.424 11 4 10.552 4 10s.424-1 .947-1h10.105z" />
            </svg>
          </button>
        </div>
      </div>
    </Group>
  );
};

export default Lens;
