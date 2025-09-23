import { useState } from "react";
import type { SelectOption } from "#components/Select";
import Select from "#components/Select";
import Tabs from "#components/Tabs";
import Button from "#components/Button";
import Line from "../Line";

import { formats, cameraOptions, materialOptions } from "./content";

type TabItem = {
  id: number;
  name: string;
  onClick?: () => void;
};

function Object3D() {
  const [format, setFormat] = useState<SelectOption | null>(formats[0] ?? null);
  const [camera, setCamera] = useState<SelectOption | null>(
    cameraOptions[0] ?? null,
  );
  const [material, setMaterial] = useState<TabItem>(
    materialOptions[0] ?? { id: 0, name: "Default" },
  );

  return (
    <div className="flex flex-col grow p-4">
      <div className="flex flex-col gap-1.5 mb-3">
        <Line title="Format">
          <Select
            value={format}
            onChange={setFormat}
            options={formats}
            isWhite
            icon={
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path d="M8.693 1.837a2.7 2.7 0 0 1 2.615 0l5.333 2.955A2.62 2.62 0 0 1 18 7.082v5.836a2.62 2.62 0 0 1-1.359 2.29l-5.333 2.955a2.7 2.7 0 0 1-2.615 0l-5.333-2.955A2.62 2.62 0 0 1 2 12.918V7.082a2.62 2.62 0 0 1 1.359-2.29l5.333-2.955zM3.92 7.714v5.204c0 .266.145.511.381.641l4.739 2.626v-5.633L3.92 7.714zm12.16 0l-5.12 2.838v5.631l4.739-2.625c.202-.112.337-.308.372-.529l.009-.112V7.714zm-5.714-4.228c-.227-.126-.505-.126-.732 0L4.917 6.099 10 8.914l5.082-2.816-4.716-2.613z" />
              </svg>
            }
          />
        </Line>
        <Line title="Camera">
          <Select
            value={camera}
            onChange={setCamera}
            options={cameraOptions}
            isWhite
            icon={
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path d="M2.96 12.453a.96.96 0 0 1 .96.96v1.92c0 .412.334.747.747.747h1.92a.96.96 0 1 1 0 1.92h-1.92C3.194 18 2 16.806 2 15.333v-1.92a.96.96 0 0 1 .96-.96zm14.08 0a.96.96 0 0 1 .96.96v1.92C18 16.806 16.806 18 15.333 18h-1.92a.96.96 0 1 1 0-1.92h1.92c.412 0 .747-.334.747-.747v-1.92a.96.96 0 0 1 .96-.96zM10 6.267c2.062 0 3.733 1.671 3.733 3.733S12.062 13.733 10 13.733 6.267 12.062 6.267 10 7.938 6.267 10 6.267zm0 1.92c-1.001 0-1.813.812-1.813 1.813s.812 1.813 1.813 1.813 1.813-.812 1.813-1.813S11.001 8.187 10 8.187zM6.587 2a.96.96 0 1 1 0 1.92h-1.92c-.412 0-.747.334-.747.747v1.92a.96.96 0 1 1-1.92 0v-1.92C2 3.194 3.194 2 4.667 2h1.92zm8.747 0C16.806 2 18 3.194 18 4.667v1.92a.96.96 0 1 1-1.92 0v-1.92c0-.412-.334-.747-.747-.747h-1.92a.96.96 0 1 1 0-1.92h1.92z" />
              </svg>
            }
          />
        </Line>
        <Line title="Material">
          <Tabs
            items={materialOptions}
            value={material}
            setValue={setMaterial}
            isMedium
          />
        </Line>
      </div>
      <Button className="w-full mt-auto" isSecondary>
        Export Robot 2.0
      </Button>
    </div>
  );
}

export default Object3D;
