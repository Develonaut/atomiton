import Field from "#components/Field";
import { zoomOptions } from "#components/Zoom/items";
import { useState } from "react";

type PropsLine = {
  title: string;
  keyName: string;
  onClick: () => void;
  active?: boolean;
};

function Line({ title, keyName, onClick, active }: PropsLine) {
  return (
    <button
      className="flex items-center w-full h-9 px-2 rounded-[0.625rem] cursor-pointer transition-colors hover:bg-[#F1F1F1]"
      onClick={onClick}
    >
      <div
        className={`flex justify-center items-center size-6 mr-1 opacity-0 transition-opacity ${
          active ? "opacity-100" : ""
        }`}
      >
        <svg
          className="size-4 fill-[#7B7B7B]"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M15.384 4.343a.89.89 0 0 1 1.286-.126c.388.334.443.931.121 1.334L8.729 15.657a.89.89 0 0 1-1.246.157L3.37 12.656a.97.97 0 0 1-.191-1.325.89.89 0 0 1 1.277-.198l3.417 2.623 7.51-9.413z" />
        </svg>
      </div>
      <div className="text-[0.75rem] leading-[1rem] font-medium text-[#000]">
        {title}
      </div>
      <div className="min-w-8.5 ml-auto text-center px-1.5 py-0.5 bg-[#F1F1F1] rounded-md shadow-[0_0px_0px_1px_rgba(0,0,0,0.11),0px_2px_0.8px_0px_rgba(255,255,255,0.27)_inset,0px_-1px_0.6px_0px_rgba(0,0,0,0.20)_inset,0px_1px_4.2px_-1px_rgba(0,0,0,0.25)] text-[0.6875rem] leading-[1rem] font-medium text-[#7B7B7B]">
        {keyName}
      </div>
    </button>
  );
}

type Props = {
  className?: string;
};

function Zoom({ className }: Props) {
  const [percentage, setPercentage] = useState("100%");
  const [activeId, setActiveId] = useState(2);
  const [comments, setComments] = useState(true);
  const [view, setView] = useState(true);

  return (
    <div className={`${className || ""}`}>
      <div className="p-2 border-b border-[#ECECEC]">
        <div className="relative">
          <Field
            classInput="!h-9 !pl-9 !bg-[#F8F7F7]"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            icon={
              <svg
                className="size-4 fill-[#7B7B7B]"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M2.96 12.453a.96.96 0 0 1 .96.96v1.92c0 .412.334.747.747.747h1.92a.96.96 0 1 1 0 1.92h-1.92C3.194 18 2 16.806 2 15.333v-1.92a.96.96 0 0 1 .96-.96zm14.08 0a.96.96 0 0 1 .96.96v1.92C18 16.806 16.806 18 15.333 18h-1.92a.96.96 0 1 1 0-1.92h1.92c.412 0 .747-.334.747-.747v-1.92a.96.96 0 0 1 .96-.96zM10 6.267a.96.96 0 0 1 .96.96V9.04h1.813a.96.96 0 0 1 .951.83l.009.13a.96.96 0 0 1-.96.96H10.96v1.813a.96.96 0 0 1-.83.951l-.13.009a.96.96 0 0 1-.96-.96V10.96H7.227a.96.96 0 0 1-.951-.83L6.267 10a.96.96 0 0 1 .96-.96H9.04V7.227a.96.96 0 0 1 .83-.951l.13-.009zM6.587 2a.96.96 0 1 1 0 1.92h-1.92c-.412 0-.747.334-.747.747v1.92a.96.96 0 1 1-1.92 0v-1.92C2 3.194 3.194 2 4.667 2h1.92zm8.747 0C16.806 2 18 3.194 18 4.667v1.92a.96.96 0 1 1-1.92 0v-1.92c0-.412-.334-.747-.747-.747h-1.92a.96.96 0 1 1 0-1.92h1.92z" />
              </svg>
            }
          />
        </div>
      </div>
      <div className="p-2">
        {zoomOptions.map((item) => (
          <Line
            title={item.title}
            keyName={item.keyName}
            onClick={() => setActiveId(item.id)}
            active={activeId === item.id}
            key={item.keyName}
          />
        ))}
        <div className="-mx-2 h-0.25 my-2 bg-[#ECECEC]"></div>
        <Line
          title="Comments"
          keyName="Shift C"
          onClick={() => setComments(!comments)}
          active={comments}
        />
        <Line
          title="3D Views"
          keyName="Shift"
          onClick={() => setView(!view)}
          active={view}
        />
      </div>
    </div>
  );
}

export default Zoom;
