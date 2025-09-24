import { useState } from "react";
import Switch from "#components/Switch";
import UploadAvatar from "#components/UploadAvatar";
import NewField from "#components/NewField";
import Title from "#components/Settings/Title";
import Option from "#components/Settings/Option";

function Profile() {
  const [privateProfile, setPrivateProfile] = useState(false);
  const [link, setLink] = useState("atomiton.app/@username");

  return (
    <>
      <Title value="Profile" />
      <Option title="Private profile">
        <Switch
          checked={privateProfile}
          onChange={() => setPrivateProfile(!privateProfile)}
        />
      </Option>
      <Option title="Avatar" description="Use 800x800 px (PNG/JPG)">
        <UploadAvatar image="/images/avatars/1.png" />
      </Option>
      <Option title="Portfolio link">
        <NewField
          placeholder="Enter new link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </Option>
      <Option title="Display name">
        <div className="text-[0.75rem] font-medium">Sophie Bennett ®</div>
      </Option>
    </>
  );
}

export default Profile;
