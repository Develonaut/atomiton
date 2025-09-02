import { useState } from "react";
import Select from "@/components/Select";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import Line from "../Line";

import { formats, cameraOptions, materialOptions } from "./content";

const Object3D = () => {
  const [format, setFormat] = useState(formats[0]);
  const [camera, setCamera] = useState(cameraOptions[0]);
  const [material, setMaterial] = useState(materialOptions[0]);

  return (
    <div className="flex flex-col grow p-4">
      <div className="flex flex-col gap-1.5 mb-3">
        <Line title="Format">
          <Select
            icon="cube"
            value={format}
            onChange={setFormat}
            options={formats}
            isMedium
            isWhite
          />
        </Line>
        <Line title="Camera">
          <Select
            icon="camera"
            value={camera}
            onChange={setCamera}
            options={cameraOptions}
            isMedium
            isWhite
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
};

export default Object3D;
