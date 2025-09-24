import { useState } from "react";
import Switch from "#components/Switch";
import type { SelectOption } from "#components/Select";
import Select from "#components/Select";
import NewField from "#components/NewField";
import Title from "#components/Title";
import Option from "#components/Option";

function General() {
  const [username, setUsername] = useState("sophie");
  const [autoPrompt, setAutoPrompt] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [publish, setPublish] = useState(false);

  const languages = [
    {
      id: 0,
      name: "Auto detech",
    },
    {
      id: 1,
      name: "English",
    },
    {
      id: 2,
      name: "Spanish",
    },
  ];
  const [language, setLanguage] = useState<SelectOption | null>(
    languages[0] ?? null,
  );

  return (
    <>
      <Title value="General" />
      <Option title="Usename">
        <NewField
          placeholder="Enter new username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Option>
      <Option title="Email">
        <div className="text-[0.75rem] leading-[1rem] font-medium text-[#121212]/30">
          sophie@ui.live
        </div>
      </Option>
      <Option title="Enable auto-prompt idea suggestion">
        <Switch
          checked={autoPrompt}
          onChange={() => setAutoPrompt(!autoPrompt)}
        />
      </Option>
      <Option title="Auto-play video on Explore">
        <Switch checked={autoPlay} onChange={() => setAutoPlay(!autoPlay)} />
      </Option>
      <Option title="Publish to Explore">
        <Switch checked={publish} onChange={() => setPublish(!publish)} />
      </Option>
      <Option title="Language">
        <Select
          className="min-w-32"
          value={language}
          onChange={setLanguage}
          options={languages}
        />
      </Option>
    </>
  );
}

export default General;
