import { useState } from "react";
import Switch from "#components/form/Switch";
import Button from "#components/Button";
import Title from "#components/User/Settings/Security/Title";
import Option from "#components/User/Settings/Security/Option";
import Field from "#components/User/Settings/Security/Field";

function Security() {
  const [username, setUsername] = useState("••••••••••••••");
  const [authentication, setAuthentication] = useState(false);

  return (
    <>
      <Title value="Security" />
      <Option title="Password">
        <Field
          label="Password"
          placeholder="Enter new password"
          value={username}
          onChange={(value) => setUsername(value)}
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
