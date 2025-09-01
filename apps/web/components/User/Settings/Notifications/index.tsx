import { useState } from "react";
import Switch from "@/components/Switch";
import Select from "@/components/Select";
import Title from "../Title";
import Option from "../Option";

const Notifications = () => {
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
        <Select
          className="min-w-32"
          value={display}
          onChange={setDisplay}
          options={displays}
          isMedium
        />
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
};

export default Notifications;
