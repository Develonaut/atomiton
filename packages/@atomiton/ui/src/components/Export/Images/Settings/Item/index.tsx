import type { SelectOption } from "#components/Select";
import Select from "#components/Select";
import Tabs from "#components/Tabs";
import { useState } from "react";

import { formats, formatsColor, sizes } from "#content";

type Props = {
  defaultSize: number;
};

type TabItem = {
  id: number;
  name: string;
  onClick?: () => void;
};

function Item({ defaultSize }: Props) {
  const [size, setSize] = useState<SelectOption | null>(
    sizes[defaultSize] ?? null,
  );
  const [formatColor, setFormatColor] = useState<SelectOption | null>(
    formatsColor[0] ?? null,
  );
  const [format, setFormat] = useState<TabItem>(
    formats[0] ?? { id: 0, name: "Default" },
  );

  return (
    <div className="flex items-center gap-1.5">
      <Select
        className="w-20"
        classButton="!px-2 !text-[0.75rem]"
        value={size}
        onChange={setSize}
        options={sizes}
        icon={
          <svg className="size-5" width={20} height={20} viewBox="0 0 20 20">
            <path d="M2.96 12.453a.96.96 0 0 1 .96.96v1.92c0 .412.334.747.747.747h1.92a.96.96 0 1 1 0 1.92h-1.92C3.194 18 2 16.806 2 15.333v-1.92a.96.96 0 0 1 .96-.96zm14.08 0a.96.96 0 0 1 .96.96v1.92C18 16.806 16.806 18 15.333 18h-1.92a.96.96 0 1 1 0-1.92h1.92c.412 0 .747-.334.747-.747v-1.92a.96.96 0 0 1 .96-.96zM10 6.267a.96.96 0 0 1 .96.96V9.04h1.813a.96.96 0 0 1 .951.83l.009.13a.96.96 0 0 1-.96.96H10.96v1.813a.96.96 0 0 1-.83.951l-.13.009a.96.96 0 0 1-.96-.96V10.96H7.227a.96.96 0 0 1-.951-.83L6.267 10a.96.96 0 0 1 .96-.96H9.04V7.227a.96.96 0 0 1 .83-.951l.13-.009zM6.587 2a.96.96 0 1 1 0 1.92h-1.92c-.412 0-.747.334-.747.747v1.92a.96.96 0 1 1-1.92 0v-1.92C2 3.194 3.194 2 4.667 2h1.92zm8.747 0C16.806 2 18 3.194 18 4.667v1.92a.96.96 0 1 1-1.92 0v-1.92c0-.412-.334-.747-.747-.747h-1.92a.96.96 0 1 1 0-1.92h1.92z" />
          </svg>
        }
      />
      <Select
        className="w-33"
        classButton="!px-2 !text-[0.75rem]"
        value={formatColor}
        onChange={setFormatColor}
        options={formatsColor}
        isWhite
        icon={
          <svg className="size-5" width={20} height={20} viewBox="0 0 20 20">
            <path d="M2.96 12.453a.96.96 0 0 1 .96.96v1.92c0 .412.334.747.747.747h1.92a.96.96 0 1 1 0 1.92h-1.92C3.194 18 2 16.806 2 15.333v-1.92a.96.96 0 0 1 .96-.96zm14.08 0a.96.96 0 0 1 .96.96v1.92C18 16.806 16.806 18 15.333 18h-1.92a.96.96 0 1 1 0-1.92h1.92c.412 0 .747-.334.747-.747v-1.92a.96.96 0 0 1 .96-.96zM9.126 7.043a.96.96 0 0 1 1.748 0l1.707 3.755.64 1.408a.96.96 0 1 1-1.748.795l-.385-.846H8.911L8.527 13a.96.96 0 0 1-1.149.523l-.122-.046a.96.96 0 0 1-.477-1.271l.64-1.408 1.707-3.755zM6.587 2a.96.96 0 1 1 0 1.92h-1.92c-.412 0-.747.334-.747.747v1.92a.96.96 0 1 1-1.92 0v-1.92C2 3.194 3.194 2 4.667 2h1.92zm8.747 0C16.806 2 18 3.194 18 4.667v1.92a.96.96 0 1 1-1.92 0v-1.92c0-.412-.334-.747-.747-.747h-1.92a.96.96 0 1 1 0-1.92h1.92z" />
          </svg>
        }
      />
      <Tabs
        className="grow"
        items={formats}
        value={format}
        setValue={setFormat}
        isMedium
      />
      <button className="ml-1 flex items-center justify-center size-6 rounded-md fill-[#7B7B7B] cursor-pointer transition-colors hover:bg-[#F1F1F1] hover:fill-[#121212]">
        <svg
          className="size-4 fill-inherit"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M15.053 9c.523 0 .947.448.947 1s-.424 1-.947 1H4.947C4.424 11 4 10.552 4 10s.424-1 .947-1h10.105z" />
        </svg>
      </button>
    </div>
  );
}

export default Item;
