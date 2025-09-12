import { useState } from "react";
import Switch from "@/components/form/Switch";
import Select from "@/components/form/Select";
import Title from "../Title";
import Option from "../Option";
import Field from "../Field";

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
  const [language, setLanguage] = useState(languages[0]);

  return (
    <>
      <Title value="General" />
      <Option title="Usename">
        <Field
          placeholder="Enter new username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Option>
      <Option title="Email">
        <div className="text-primary/30">sophie@ui.live</div>
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
        <Select value={language} onChange={setLanguage} className="min-w-32">
          <Select.Trigger isMedium>
            {language && <Select.Value>{language.name}</Select.Value>}
            <Select.Indicator isMedium />
          </Select.Trigger>
          <Select.Options>
            {languages.map((option) => (
              <Select.Option key={option.id} value={option} isMedium>
                {option.name}
              </Select.Option>
            ))}
          </Select.Options>
        </Select>
      </Option>
    </>
  );
}

export default General;
