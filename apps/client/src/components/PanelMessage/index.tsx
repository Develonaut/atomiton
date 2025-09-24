import AddFiles from "#components/PanelMessage/AddFiles";
import SelectAi from "#components/PanelMessage/SelectAi";
import Button from "#components/Button";
import Icon from "#components/Icon";
import ViewController from "#components/ViewController";
import Select from "#components/form/Select";
import { Box } from "@atomiton/ui";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

const settings = [
  { id: 0, name: "Inspiration" },
  { id: 1, name: "Describe" },
];

type AudioIndicatorProps = {
  isRecording: boolean;
};

function AudioIndicator({ isRecording }: AudioIndicatorProps) {
  if (!isRecording) return null;

  return (
    <Box className="absolute top-6 right-6 size-4 border border-orange/10 rounded-full before:absolute before:top-1/2 before:left-1/2 before:-translate-1/2 before:size-2 before:bg-gradient-to-b before:from-[#FF732D] before:to-[#E24D03] before:rounded-full before:animate-pulse" />
  );
}

type MessageInputProps = {
  message: string;
  onMessageChange: (message: string) => void;
  isRecording: boolean;
};

function MessageInput({
  message,
  onMessageChange,
  isRecording,
}: MessageInputProps) {
  return (
    <TextareaAutosize
      className={`w-full bg-transparent !h-6 mb-8 pl-2 text-title text-primary outline-none resize-none placeholder:text-secondary ${
        isRecording ? "pr-10 pointer-events-none" : ""
      }`}
      maxRows={5}
      value={message}
      onChange={(e) => onMessageChange(e.target.value)}
      placeholder={
        isRecording
          ? "Ask me anything..."
          : "Describe your 3D object or scene..."
      }
      autoFocus
    />
  );
}

type ControlsProps = {
  isRecording: boolean;
  onRecordingToggle: () => void;
  hasMessage: boolean;
  setting: { id: number; name: string };
  onSettingChange: (setting: { id: number; name: string }) => void;
};

function Controls({
  isRecording,
  onRecordingToggle,
  hasMessage,
  setting,
  onSettingChange,
}: ControlsProps) {
  const disabledClass = isRecording ? "opacity-30 pointer-events-none" : "";

  return (
    <Box className="flex gap-2">
      <AddFiles className={disabledClass} />
      <Select
        value={setting}
        onChange={onSettingChange}
        className={`min-w-38.5 mr-auto ${disabledClass}`}
      >
        <Select.Trigger className="!rounded-xl !text-heading" isWhite>
          <Select.Icon>
            <Icon className="!size-4 !mr-3 !fill-green" name="flash" />
          </Select.Icon>
          {setting && <Select.Value>{setting.name}</Select.Value>}
          <Select.Indicator />
        </Select.Trigger>
        <Select.Options>
          {settings.map((option) => (
            <Select.Option key={option.id} value={option}>
              {option.name}
            </Select.Option>
          ))}
        </Select.Options>
      </Select>
      <SelectAi className={disabledClass} />
      <button
        className="group size-10 rounded-xl transition-colors hover:bg-surface-03"
        onClick={onRecordingToggle}
      >
        <Icon
          className="fill-secondary transition-colors group-hover:fill-primary"
          name={isRecording ? "close-think" : "microphone"}
        />
      </button>
      <Button
        className="w-10 !p-0"
        isPrimary={!hasMessage}
        isSecondary={hasMessage}
      >
        <Icon className="-rotate-90 fill-inherit" name="arrow" />
      </Button>
    </Box>
  );
}

type PanelMessageProps = {
  className?: string;
  isViewController?: boolean;
};

function PanelMessage({ className, isViewController }: PanelMessageProps) {
  const [message, setMessage] = useState("");
  const [setting, setSetting] = useState(settings[0]);
  const [isRecording, setIsRecording] = useState(false);

  const hasMessage = message !== "";

  return (
    <Box
      className={`fixed left-1/2 bottom-3 z-10 -translate-x-1/2 w-135.5 pt-5 p-3 shadow-prompt-input border border-s-01 bg-surface-01 rounded-3xl ${
        className || ""
      }`}
    >
      {isViewController && <ViewController />}

      <AudioIndicator isRecording={isRecording} />

      <MessageInput
        message={message}
        onMessageChange={setMessage}
        isRecording={isRecording}
      />

      <Controls
        isRecording={isRecording}
        onRecordingToggle={() => setIsRecording(!isRecording)}
        hasMessage={hasMessage}
        setting={setting}
        onSettingChange={setSetting}
      />
    </Box>
  );
}

export default PanelMessage;
