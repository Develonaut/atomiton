import { useState } from "react";
import Select from "@/components/Select";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import Line from "../Line";

import {
  cameraOptions,
  formats,
  frameRateOptions,
  resolutionOptions,
} from "./content";

function Video() {
  const [camera, setCamera] = useState(cameraOptions[0]);
  const [format, setFormat] = useState(formats[0]);
  const [frameRate, setFrameRate] = useState(frameRateOptions[0]);
  const [resolution, setResolution] = useState(resolutionOptions[1]);

  return (
    <div className="flex flex-col grow p-4">
      <div className="flex flex-col gap-1.5 mb-3">
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
        <Line title="Format">
          <Tabs items={formats} value={format} setValue={setFormat} isMedium />
        </Line>
        <Line title="Frame rate">
          <Select
            icon="video"
            indicator="FPS"
            value={frameRate}
            onChange={setFrameRate}
            options={frameRateOptions}
            isMedium
            isWhite
          />
        </Line>
        <Line title="Resolution">
          <Tabs
            items={resolutionOptions}
            value={resolution}
            setValue={setResolution}
            isMedium
          />
          <div className="mt-0.5 text-[0.625rem] text-right text-secondary/80">
            3840px × 2160px
          </div>
        </Line>
      </div>
      <div className="mt-auto mb-2 text-center text-[0.625rem] text-secondary/80">
        Estimation — Export time 30 seconds — Output size 35MB
      </div>
      <Button className="w-full" isSecondary>
        Export Robot 2.0
      </Button>
    </div>
  );
}

export default Video;
