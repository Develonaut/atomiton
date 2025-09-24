import { NumberInput } from "#components/form";
import Icon from "#components/Icon";
import Select from "#components/form/Select";
import { useState } from "react";
import Group from "./../Group";

type XPostOption = {
  id: number;
  name: string;
};

const xPostOptions: XPostOption[] = [
  { id: 0, name: "800x600" },
  { id: 1, name: "1024x768" },
  { id: 2, name: "1280x1024" },
  { id: 3, name: "1600x1200" },
  { id: 4, name: "1920x1080" },
];

/**
 * ArtboardComposition Component
 *
 * Example of using the new Select composition API for better flexibility
 * and composition patterns.
 */
function ArtboardComposition() {
  const [xPost, setXPost] = useState<XPostOption>(xPostOptions[0]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  return (
    <Group title="Artboard">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Select value={xPost} onChange={setXPost} className="grow">
            <Select.Trigger isMedium isWhite>
              <Select.Icon>
                <Icon name="camera-1" className="!size-4" />
              </Select.Icon>
              <Select.Label>X Post</Select.Label>
              <Select.Placeholder>Select resolution</Select.Placeholder>
              <Select.Value>{xPost.name}</Select.Value>
              <Select.Indicator isMedium />
            </Select.Trigger>
            <Select.Options>
              {xPostOptions.map((option) => (
                <Select.Option key={option.id} value={option} isMedium>
                  {option.name}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>

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

export default ArtboardComposition;
