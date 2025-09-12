import { useState } from "react";
import Switch from "@/components/Switch";
import Select from "@/components/form/Select";
import Title from "../Title";
import Option from "../Option";

function Notifications() {
  const displays = [
    {
      id: 0,
      name: "Push",
    },
    {
      id: 1,
      name: "Email",
    },
    {
      id: 2,
      name: "None",
    },
  ];

  const [display, setDisplay] = useState(displays[0]);
  const [videoGenerated, setVideoGenerated] = useState(true);
  const [objectGenerated, setObjectGenerated] = useState(false);
  const [someoneMentioned, setSomeoneMentioned] = useState(true);

  return (
    <>
      <Title value="Notifications" />
      <Option title="Display while working">
        <Select value={display} onChange={setDisplay} className="min-w-32">
          <Select.Trigger isMedium>
            {display && <Select.Value>{display.name}</Select.Value>}
            <Select.Indicator isMedium />
          </Select.Trigger>
          <Select.Options>
            {displays.map((option) => (
              <Select.Option key={option.id} value={option} isMedium>
                {option.name}
              </Select.Option>
            ))}
          </Select.Options>
        </Select>
      </Option>
      <Option title="Video generated">
        <Switch
          checked={videoGenerated}
          onChange={() => setVideoGenerated(!videoGenerated)}
        />
      </Option>
      <Option title="3D Object generated">
        <Switch
          checked={objectGenerated}
          onChange={() => setObjectGenerated(!objectGenerated)}
        />
      </Option>
      <Option title="Someone mentioned in the comment">
        <Switch
          checked={someoneMentioned}
          onChange={() => setSomeoneMentioned(!someoneMentioned)}
        />
      </Option>
    </>
  );
}

export default Notifications;
