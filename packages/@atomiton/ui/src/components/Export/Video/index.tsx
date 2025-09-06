import { useState } from "react";
import Select, { SelectOption } from "@/components/Select";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import Line from "../Line";

import {
  cameraOptions,
  formats,
  frameRateOptions,
  resolutionOptions,
} from "./content";

type TabItem = {
  id: number;
  name: string;
  onClick?: () => void;
};

const Video = () => {
  const [camera, setCamera] = useState<SelectOption | null>(
    cameraOptions[0] ?? null,
  );
  const [format, setFormat] = useState<TabItem>(
    formats[0] ?? { id: 0, name: "Default" },
  );
  const [frameRate, setFrameRate] = useState<SelectOption | null>(
    frameRateOptions[0] ?? null,
  );
  const [resolution, setResolution] = useState<TabItem>(
    resolutionOptions[1] ?? { id: 0, name: "Default" },
  );

  return (
    <div className="flex flex-col grow p-4">
      <div className="flex flex-col gap-1.5 mb-3">
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
        <Line title="Format">
          <Tabs items={formats} value={format} setValue={setFormat} isMedium />
        </Line>
        <Line title="Frame rate">
          <Select
            indicator="FPS"
            value={frameRate}
            onChange={setFrameRate}
            options={frameRateOptions}
            isWhite
            icon={
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path d="M15.94 3.197c1.414 0 2.56 1.153 2.56 2.575v1.545 1.854 5.254a2.57 2.57 0 0 1-2.377 2.569L15.94 17H4.06c-1.414 0-2.56-1.153-2.56-2.575V7.317 5.772c0-1.422 1.146-2.575 2.56-2.575h1.907L6 3.033l.81.164h.834 2.009l.033-.164.81.164h.834 2.25L13.631 3l.782.197h.811.717zm-5.595 5.974l-.031.164-.812-.164h-.833-2.011l-.031.164-.812-.164h-.833-1.639v5.254a.72.72 0 0 0 .601.712l.116.009h11.88a.72.72 0 0 0 .717-.721V9.171h-2.457-.203l-.048.198-.784-.198h-.808-2.011zm-4.747-4.12H4.06a.72.72 0 0 0-.717.721v1.545h1.804l.45-2.266zm3.687 0H7.645h-.167l-.45 2.266h1.807l.45-2.266zm3.837 0h-1.956l-.45 2.266h1.842l.564-2.266zm1.336 2.266h2.2V5.772a.72.72 0 0 0-.601-.712l-.116-.009h-.919l-.564 2.266z" />
              </svg>
            }
          />
        </Line>
        <Line title="Resolution">
          <Tabs
            items={resolutionOptions}
            value={resolution}
            setValue={setResolution}
            isMedium
          />
          <div className="mt-0.5 text-[0.625rem] text-right text-[#7B7B7B]/80">
            3840px × 2160px
          </div>
        </Line>
      </div>
      <div className="mt-auto mb-2 text-center text-[0.625rem] text-[#7B7B7B]/80">
        Estimation — Export time 30 seconds — Output size 35MB
      </div>
      <Button className="w-full" isSecondary>
        Export Robot 2.0
      </Button>
    </div>
  );
};

export default Video;
