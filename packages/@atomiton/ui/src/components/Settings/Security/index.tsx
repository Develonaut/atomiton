import { useState } from "react";
import Switch from "#components/Switch";
import Button from "#components/Button";
import NewField from "#components/NewField";
import Title from "#components/Title";
import Option from "#components/Option";

function Security() {
  const [username, setUsername] = useState("••••••••••••••");
  const [authentication, setAuthentication] = useState(false);

  return (
    <>
      <Title value="Security" />
      <Option title="Password">
        <NewField
          placeholder="Enter new username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="password"
        />
      </Option>
      <Option title="Multi-factor authentication">
        <Switch
          checked={authentication}
          onChange={() => setAuthentication(!authentication)}
        />
      </Option>
      <Option
        title="Log out of all devices"
        description="Sign out from all devices."
      >
        <Button isPrimary>Log out all</Button>
      </Option>
    </>
  );
}

export default Security;
