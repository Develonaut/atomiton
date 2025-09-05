import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Select, { SelectOption } from "@/components/Select";
import SubmitButton from "@/components/SubmitButton";
import ViewController from "@/components/ViewController";
import AddFiles from "./AddFiles";
import SelectAi from "./SelectAi";
import PremadePrompt from "./PremadePrompt";

const settings = [
  { id: 0, name: "Inspiration" },
  { id: 1, name: "Describe" },
];

type Props = {
  className?: string;
  isViewController?: boolean;
  collapsed?: boolean;
  premadePrompt?: boolean;
};

const PromptInput = ({
  className,
  collapsed,
  premadePrompt,
  isViewController,
}: Props) => {
  const [message, setMessage] = useState("");
  const [setting, setSetting] = useState<SelectOption | null>(
    settings[0] ?? null,
  );
  const [visibleAudio, setVisibleAudio] = useState(false);

  return (
    <div
      className={`relative w-135.5 p-3 border border-[#ececec] bg-[#fcfcfc] rounded-3xl shadow-[0px_18px_24px_-20px_rgba(0,0,0,0.13),0px_2px_0px_0px_#FFF_inset,0px_8px_16px_-12px_rgba(0,0,0,0.08)] transition-colors hover:border-[#E2E2E2] ${
        className || ""
      }`}
    >
      {isViewController && <ViewController />}
      {visibleAudio && (
        <div className="absolute top-6 right-6 size-4 border border-[#e36323]/10 rounded-full before:absolute before:top-1/2 before:left-1/2 before:-translate-1/2 before:size-2 before:bg-gradient-to-b before:from-[#FF732D] before:to-[#E24D03] before:rounded-full before:animate-pulse"></div>
      )}
      {(visibleAudio || !collapsed) && (
        <TextareaAutosize
          className={`w-full bg-transparent !h-6 mt-2 mb-8 pl-2 text-[0.9375rem] leading-[1.5rem] text-[#121212] resize-none outline-none placeholder:text-[#7b7b7b] ${
            visibleAudio ? "pr-10 pointer-events-none" : ""
          }`}
          maxRows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            visibleAudio
              ? "Ask me anything..."
              : "Describe your 3D object or scene..."
          }
          autoFocus
        />
      )}
      <div className="flex gap-2">
        <AddFiles
          className={visibleAudio ? "opacity-30 pointer-events-none" : ""}
        />
        <Select
          className={`min-w-38.5 mr-auto ${
            visibleAudio ? "opacity-30 pointer-events-none" : ""
          }`}
          classButton="!h-10 !rounded-xl !border-[#E2E2E2] !text-[0.875rem] [&_svg]:first:fill-[#55b93e] transition-all data-[hover]:shadow-[0px_2px_8px_-4px_rgba(0,0,0,0.25)]"
          value={setting}
          onChange={setSetting}
          options={settings}
          isWhite
          icon={
            <svg width={20} height={20} viewBox="0 0 20 20">
              <path d="M9.149 1.683c.852-1.272 2.787-.651 2.787.894v3.749l4.033.001c1.18 0 1.896 1.307 1.338 2.335l-.08.132-6.376 9.522c-.852 1.272-2.787.651-2.787-.894l-.001-3.751-4.032.001c-1.18 0-1.896-1.307-1.338-2.336l.08-.132 6.376-9.522zm.952 1.904l-5.489 8.196 3.757.001c.791 0 1.442.619 1.521 1.413l.008.161-.001 3.053 5.489-8.196-3.756.001c-.791 0-1.442-.619-1.521-1.413l-.008-.161V3.587z" />
            </svg>
          }
        />
        <SelectAi
          className={`${visibleAudio ? "opacity-30 pointer-events-none" : ""}`}
        />
        <button
          className="group flex items-center justify-center shrink-0 size-10 rounded-xl transition-colors cursor-pointer hover:bg-[#f1f1f1]"
          onClick={() => setVisibleAudio(!visibleAudio)}
        >
          <svg
            className="size-5 fill-[#7b7b7b] transition-colors group-hover:fill-[#121212]"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path
              d={
                visibleAudio
                  ? "M3.43 3.43a.75.75 0 0 1 1.061 0l5.511 5.511 5.512-5.511a.75.75 0 0 1 .977-.073l.084.073a.75.75 0 0 1 0 1.061l-5.512 5.511 5.512 5.512a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0l-5.512-5.512-5.511 5.512a.75.75 0 0 1-.977.073l-.084-.073a.75.75 0 0 1 0-1.061l5.511-5.512L3.43 4.49a.75.75 0 0 1-.073-.977l.073-.084z"
                  : "M15.043 11.781a.75.75 0 1 1 1.375.601c-.998 2.285-3.137 3.868-5.611 4.154l-.057.004.001 1.167a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75l-.001-1.167-.055-.004c-2.386-.275-4.46-1.757-5.5-3.911l-.111-.242a.75.75 0 0 1 1.375-.601 5.5 5.5 0 0 0 5.043 3.3l.236-.005a5.5 5.5 0 0 0 4.71-3.085l.097-.21zM10 1.54c2.37 0 4.292 1.921 4.292 4.292v3.75c0 2.37-1.921 4.292-4.292 4.292s-4.292-1.921-4.292-4.292v-3.75C5.708 3.461 7.63 1.54 10 1.54zm0 1.5a2.79 2.79 0 0 0-2.792 2.792v3.75a2.79 2.79 0 1 0 5.583 0v-3.75A2.79 2.79 0 0 0 10 3.04z"
              }
            />
          </svg>
        </button>
        <SubmitButton />
      </div>
      {premadePrompt && !visibleAudio && <PremadePrompt />}
    </div>
  );
};

export default PromptInput;
