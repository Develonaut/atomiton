import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Icon from "@/components/Icon";
import Select from "@/components/Select";
import Button from "@/components/Button";
import VideoPlayer from "@/components/VideoPlayer";
import ViewController from "@/components/ViewController";
import AddFiles from "./AddFiles";
import SelectAi from "./SelectAi";
import useStore from "@/store";

const settings = [
  { id: 0, name: "Inspiration" },
  { id: 1, name: "Describe" },
];

type Props = {
  className?: string;
  isViewController?: boolean;
};

const PanelMessage = ({ className, isViewController }: Props) => {
  const { isAnimationSettings } = useStore((state) => state);
  const [message, setMessage] = useState("");
  const [setting, setSetting] = useState(settings[0]);
  const [visibleAudio, setVisibleAudio] = useState(false);

  const isMessage = message !== "";

  return (
    <div
      className={`fixed left-1/2 bottom-3 z-10 -translate-x-1/2 w-135.5 pt-5 p-3 shadow-prompt-input border border-s-01 bg-surface-01 rounded-3xl ${
        className || ""
      }`}
    >
      {isAnimationSettings ? (
        <VideoPlayer className="bottom-full mb-4" />
      ) : (
        isViewController && <ViewController />
      )}
      {visibleAudio && (
        <div className="absolute top-6 right-6 size-4 border border-orange/10 rounded-full before:absolute before:top-1/2 before:left-1/2 before:-translate-1/2 before:size-2 before:bg-gradient-to-b before:from-[#FF732D] before:to-[#E24D03] before:rounded-full before:animate-pulse"></div>
      )}
      <TextareaAutosize
        className={`w-full bg-transparent !h-6 mb-8 pl-2 text-title text-primary outline-none resize-none placeholder:text-secondary ${
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
      <div className="flex gap-2">
        <AddFiles
          className={visibleAudio ? "opacity-30 pointer-events-none" : ""}
        />
        <Select
          className={`min-w-38.5 mr-auto ${
            visibleAudio ? "opacity-30 pointer-events-none" : ""
          }`}
          classButton="!rounded-xl !text-heading"
          classIcon="!mr-3 !fill-green"
          icon="flash"
          value={setting}
          onChange={setSetting}
          options={settings}
          isWhite
        />
        <SelectAi
          className={`${visibleAudio ? "opacity-30 pointer-events-none" : ""}`}
        />
        <button
          className="group size-10 rounded-xl transition-colors hover:bg-surface-03"
          onClick={() => setVisibleAudio(!visibleAudio)}
        >
          <Icon
            className="fill-secondary transition-colors group-hover:fill-primary"
            name={visibleAudio ? "close-think" : "microphone"}
          />
        </button>
        <Button
          className="w-10 !p-0"
          isPrimary={!isMessage}
          isSecondary={isMessage}
        >
          <Icon className="-rotate-90 fill-inherit" name="arrow" />
        </Button>
      </div>
    </div>
  );
};

export default PanelMessage;
