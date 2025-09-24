import { useRef, useState } from "react";
import Switch from "#components/form/Switch";
import Icon from "#components/Icon";
import Image from "#components/Image";
import Title from "#components/User/Settings/Profile/Title";
import Option from "#components/User/Settings/Profile/Option";
import Field from "#components/User/Settings/Profile/Field";

function Profile() {
  const [privateProfile, setPrivateProfile] = useState(false);
  const [link, setLink] = useState("brainwave.app/@username");
  const [preview, setPreview] = useState<string | null>(
    "/images/avatars/1.png",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

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
        <div className="group relative size-12 ml-auto overflow-hidden rounded-full bg-surface-02">
          <Image
            className="size-12 opacity-100"
            src={preview || "/images/no-avatar.png"}
            width={48}
            height={48}
            alt="avatar"
          />
          <input
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            ref={inputRef}
            type="file"
            onChange={handleChange}
            accept="image/*"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Icon className="fill-shade-01" name="plus-circle" />
          </div>
        </div>
      </Option>
      <Option title="Portfolio link">
        <Field
          label="Portfolio link"
          placeholder="Enter new link"
          value={link}
          onChange={(value) => setLink(value)}
        />
      </Option>
      <Option title="Display name">Sophie Bennett ®</Option>
    </>
  );
}

export default Profile;
