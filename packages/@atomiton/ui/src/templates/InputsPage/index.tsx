import { useState } from "react";
import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import Field from "@/components/Field";
import NewField from "@/components/NewField";
import UploadAvatar from "@/components/UploadAvatar";
import Invite from "@/components/Invite";
import ColorPicker from "@/components/ColorPicker";
import Search from "@/components/Search";

function InputsPage() {
  const [value, setValue] = useState("");
  const [username, setUsername] = useState("sophie");
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Layout title="Inputs">
      <Group title="Email">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Click on, Focus, Hover, Typing"
            span={3}
            center
          >
            <Field
              className="w-60"
              label="Email"
              placeholder="Enter password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Card>
          <Card className="h-50" title="Typed" span={3} center>
            <Field
              className="w-60"
              label="Email"
              placeholder="Enter password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              validated
            />
          </Card>
          <Card className="h-50" title="Message, With icon" span={3} center>
            <Field
              className="w-60"
              label="Email"
              placeholder="Enter password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              errorMessage="This email is already taken."
              icon={
                <svg
                  className="size-4"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                >
                  <path d="M2.5 9.917a.75.75 0 0 1 .75.75v1.5c0 .322.261.583.583.583h1.5a.75.75 0 1 1 0 1.5h-1.5c-1.151 0-2.083-.933-2.083-2.083v-1.5a.75.75 0 0 1 .75-.75zm11 0a.75.75 0 0 1 .75.75v1.5c0 1.151-.933 2.083-2.083 2.083h-1.5a.75.75 0 1 1 0-1.5h1.5c.322 0 .583-.261.583-.583v-1.5a.75.75 0 0 1 .75-.75zM8 5.083a.75.75 0 0 1 .75.75v1.416l1.417.001a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.75.75L8.75 8.749v1.418a.75.75 0 0 1-.648.743L8 10.917a.75.75 0 0 1-.75-.75V8.749l-1.417.001a.75.75 0 0 1-.743-.648L5.083 8a.75.75 0 0 1 .75-.75l1.417-.001V5.833a.75.75 0 0 1 .648-.743L8 5.083zM5.333 1.75a.75.75 0 1 1 0 1.5h-1.5c-.322 0-.583.261-.583.583v1.5a.75.75 0 1 1-1.5 0v-1.5c0-1.151.933-2.083 2.083-2.083h1.5zm6.833 0c1.151 0 2.083.933 2.083 2.083v1.5a.75.75 0 1 1-1.5 0v-1.5c0-.322-.261-.583-.583-.583h-1.5a.75.75 0 1 1 0-1.5h1.5z" />
                </svg>
              }
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Password">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Click on, Focus, Hover, Typing"
            span={3}
            center
          >
            <Field
              className="w-60"
              label="Password"
              placeholder="Enter new username"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              forgotPassword
            />
          </Card>
          <Card className="h-50" title="Typed" span={3} center>
            <Field
              className="w-60"
              label="Password"
              placeholder="Enter new username"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              validated
              forgotPassword
            />
          </Card>
          <Card className="h-50" title="Message" span={3} center>
            <Field
              className="w-60"
              label="Password"
              placeholder="Enter new username"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              errorMessage="Confirm password is incorrect"
              forgotPassword
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Username">
        <RowCards>
          <Card className="h-50" title="Default, Hover, Edit, Confirm" center>
            <NewField
              placeholder="Enter new username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Replace avatar">
        <RowCards>
          <Card className="h-50" title="Default, Hover" span={2} center>
            <UploadAvatar image="/images/avatars/1.png" />
          </Card>
          <Card className="h-50" title="No avatar" span={2} center>
            <UploadAvatar />
          </Card>
        </RowCards>
      </Group>
      <Group title="Invite">
        <RowCards>
          <Card className="h-50" title="Default, Hover, Focus, Dropdown" center>
            <Invite className="w-76.5" />
          </Card>
        </RowCards>
      </Group>
      <Group title="Color picker">
        <RowCards>
          <Card className="h-50" title="Default, Hover, Focus" center>
            <ColorPicker className="w-54.5" />
          </Card>
        </RowCards>
      </Group>
      <Group title="Search">
        <RowCards>
          <Card className="h-50" title="Default, Hover, Focus" center>
            <Search
              className="w-54"
              search={search}
              onChange={(e) => setSearch(e.target.value)}
              handleSubmit={handleSubmit}
            />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
}

export default InputsPage;
