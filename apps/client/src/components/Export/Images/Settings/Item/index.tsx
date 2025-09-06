import { useState } from "react";
import Select from "@/components/Select";
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
      <Select
        className="w-20"
        classButton="!px-2"
        icon="focus-letter"
        value={size}
        onChange={setSize}
        options={sizes}
        isMedium
      />
      <Select
        className="w-33"
        classButton="!px-2"
        icon="focus-letter"
        value={formatColor}
        onChange={setFormatColor}
        options={formatsColor}
        isMedium
        isWhite
      />
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
