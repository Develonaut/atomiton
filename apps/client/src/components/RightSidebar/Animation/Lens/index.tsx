import Select from "#components/form/Select";
import Icon from "#components/Icon";
import { useState } from "react";
import Group from "#components/RightSidebar/Group";

import { lensFormats, rotates, zoomLevels } from "#components/RightSidebar/Animation/Lens/content";

function Lens() {
  const [lensFormat, setLensFormat] = useState(lensFormats[0]);
  const [zoomLevel, setZoomLevel] = useState(zoomLevels[0]);
  const [rotate, setRotate] = useState(rotates[0]);
  return (
    <Group title="Lens">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Select value={lensFormat} onChange={setLensFormat} className="grow">
            <Select.Trigger isMedium isWhite>
              <Select.Icon>
                <Icon className="!size-4" name="camera-1" />
              </Select.Icon>
              <Select.Placeholder>Select lens</Select.Placeholder>
              <Select.Value>{lensFormat.name}</Select.Value>
              <Select.Indicator isMedium />
            </Select.Trigger>
            <Select.Options>
              {lensFormats.map((option) => (
                <Select.Option key={option.id} value={option} isMedium>
                  {option.name}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>
          <button className="btn-icon size-6">
            <Icon className="!size-4" name="show-view" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={zoomLevel} onChange={setZoomLevel} className="grow">
            <Select.Trigger isMedium>
              <Select.Icon>
                <Icon className="!size-4" name="focus-letter" />
              </Select.Icon>
              <Select.Placeholder>Select zoom</Select.Placeholder>
              <Select.Value>{zoomLevel.name}</Select.Value>
              <Select.Indicator isMedium />
            </Select.Trigger>
            <Select.Options>
              {zoomLevels.map((option) => (
                <Select.Option key={option.id} value={option} isMedium>
                  {option.name}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>
          <button className="btn-icon size-6">
            <Icon className="!size-4" name="minus" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={rotate} onChange={setRotate} className="grow">
            <Select.Trigger isMedium>
              <Select.Icon>
                <Icon className="!size-4" name="focus-letter" />
              </Select.Icon>
              <Select.Placeholder>Select rotation</Select.Placeholder>
              <Select.Value>{rotate.name}</Select.Value>
              <Select.Indicator isMedium />
            </Select.Trigger>
            <Select.Options>
              {rotates.map((option) => (
                <Select.Option key={option.id} value={option} isMedium>
                  {option.name}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>
          <button className="btn-icon size-6">
            <Icon className="!size-4" name="minus" />
          </button>
        </div>
      </div>
    </Group>
  );
}

export default Lens;
