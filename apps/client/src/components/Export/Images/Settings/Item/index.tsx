import { useState } from "react";
import Select from "@/components/form/Select";
import Tabs from "@/components/Tabs";
import Icon from "@/components/Icon";

import { sizes, formatsColor, formats } from "./content";

type Props = {
  defaultSize: number;
};

function Item({ defaultSize }: Props) {
  const [size, setSize] = useState(sizes[defaultSize]);
  const [formatColor, setFormatColor] = useState(formatsColor[0]);
  const [format, setFormat] = useState(formats[0]);

  return (
    <div className="flex items-center gap-1.5">
      <Select value={size} onChange={setSize} className="w-20">
        <Select.Trigger className="!px-2" isMedium>
          <Select.Icon>
            <Icon className="!size-4" name="focus-letter" />
          </Select.Icon>
          {size && <Select.Value>{size.name}</Select.Value>}
          <Select.Indicator isMedium />
        </Select.Trigger>
        <Select.Options>
          {sizes.map((option) => (
            <Select.Option key={option.id} value={option} isMedium>
              {option.name}
            </Select.Option>
          ))}
        </Select.Options>
      </Select>
      <Select value={formatColor} onChange={setFormatColor} className="w-33">
        <Select.Trigger className="!px-2" isMedium isWhite>
          <Select.Icon>
            <Icon className="!size-4" name="focus-letter" />
          </Select.Icon>
          {formatColor && <Select.Value>{formatColor.name}</Select.Value>}
          <Select.Indicator isMedium />
        </Select.Trigger>
        <Select.Options>
          {formatsColor.map((option) => (
            <Select.Option key={option.id} value={option} isMedium>
              {option.name}
            </Select.Option>
          ))}
        </Select.Options>
      </Select>
      <Tabs
        className="grow"
        items={formats}
        value={format}
        setValue={setFormat}
        isMedium
      />
      <button className="btn-icon ml-1 size-6">
        <Icon className="!size-4" name="minus" />
      </button>
    </div>
  );
}

export default Item;
