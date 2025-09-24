import Button from "#components/Button";
import Select from "#components/form/Select";
import Icon from "#components/Icon";
import Tabs from "#components/Tabs";
import { useState } from "react";
import Line from "#components/Export/Object3D/Line";

import {
  cameraOptions,
  formats,
  materialOptions,
} from "#components/Export/Object3D/content";

function Object3D() {
  const [format, setFormat] = useState(formats[0]);
  const [camera, setCamera] = useState(cameraOptions[0]);
  const [material, setMaterial] = useState(materialOptions[0]);

  return (
    <div className="flex flex-col grow p-4">
      <div className="flex flex-col gap-1.5 mb-3">
        <Line title="Format">
          <Select value={format} onChange={setFormat}>
            <Select.Trigger isMedium isWhite>
              <Select.Icon>
                <Icon className="!size-4" name="cube" />
              </Select.Icon>
              {format && <Select.Value>{format.name}</Select.Value>}
              <Select.Indicator isMedium />
            </Select.Trigger>
            <Select.Options>
              {formats.map((option) => (
                <Select.Option key={option.id} value={option} isMedium>
                  {option.name}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>
        </Line>
        <Line title="Camera">
          <Select value={camera} onChange={setCamera}>
            <Select.Trigger isMedium isWhite>
              <Select.Icon>
                <Icon className="!size-4" name="camera" />
              </Select.Icon>
              {camera && <Select.Value>{camera.name}</Select.Value>}
              <Select.Indicator isMedium />
            </Select.Trigger>
            <Select.Options>
              {cameraOptions.map((option) => (
                <Select.Option key={option.id} value={option} isMedium>
                  {option.name}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>
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
