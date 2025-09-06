import { useState } from "react";
import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import type { SelectOption } from "@/components/Select";
import Select from "@/components/Select";

const values = [
  { id: 0, name: "Value" },
  { id: 1, name: "Value 2" },
  { id: 2, name: "Value 3" },
];

function DropdownPage() {
  const [value, setValue] = useState<SelectOption | null>(values[0] ?? null);
  const [value1, setValue1] = useState<SelectOption | null>(values[0] ?? null);
  const [value2, setValue2] = useState<SelectOption | null>(values[0] ?? null);
  const [value4, setValue4] = useState<SelectOption | null>(values[0] ?? null);
  const [value5, setValue5] = useState<SelectOption | null>(values[0] ?? null);
  const [value6, setValue6] = useState<SelectOption | null>(values[0] ?? null);

  return (
    <Layout title="Dropdown">
      <Group title="Dropdown, Icon">
        <RowCards>
          <Card className="h-50" title="Default, Focus, Hover" center>
            <Select
              className="w-44"
              value={value}
              onChange={setValue}
              options={values}
              icon={
                <svg
                  className="size-4"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                >
                  <path d="M2.5 9.917a.75.75 0 0 1 .75.75v1.5c0 .322.261.583.583.583h1.5a.75.75 0 1 1 0 1.5h-1.5c-1.151 0-2.083-.933-2.083-2.083v-1.5a.75.75 0 0 1 .75-.75zm11 0a.75.75 0 0 1 .75.75v1.5c0 1.151-.933 2.083-2.083 2.083h-1.5a.75.75 0 1 1 0-1.5h1.5c.322 0 .583-.261.583-.583v-1.5a.75.75 0 0 1 .75-.75zM7.317 5.69a.75.75 0 0 1 1.366 0l1.333 2.933.5 1.1a.75.75 0 1 1-1.366.621l-.301-.661H7.149l-.3.661a.75.75 0 0 1-.898.408l-.095-.036a.75.75 0 0 1-.372-.993l.5-1.1L7.317 5.69zM5.333 1.75a.75.75 0 1 1 0 1.5h-1.5c-.322 0-.583.261-.583.583v1.5a.75.75 0 1 1-1.5 0v-1.5c0-1.151.933-2.083 2.083-2.083h1.5zm6.833 0c1.151 0 2.083.933 2.083 2.083v1.5a.75.75 0 1 1-1.5 0v-1.5c0-.322-.261-.583-.583-.583h-1.5a.75.75 0 1 1 0-1.5h1.5z" />
                </svg>
              }
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Dropdown, Ghost">
        <RowCards>
          <Card className="h-50" title="Default, Focus, Hover" center>
            <Select
              className="w-44"
              value={value1}
              onChange={setValue1}
              options={values}
              isWhite
              icon={
                <svg
                  className="size-4"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                >
                  <path d="M2.5 9.917a.75.75 0 0 1 .75.75v1.5c0 .322.261.583.583.583h1.5a.75.75 0 1 1 0 1.5h-1.5c-1.151 0-2.083-.933-2.083-2.083v-1.5a.75.75 0 0 1 .75-.75zm11 0a.75.75 0 0 1 .75.75v1.5c0 1.151-.933 2.083-2.083 2.083h-1.5a.75.75 0 1 1 0-1.5h1.5c.322 0 .583-.261.583-.583v-1.5a.75.75 0 0 1 .75-.75zM7.317 5.69a.75.75 0 0 1 1.366 0l1.333 2.933.5 1.1a.75.75 0 1 1-1.366.621l-.301-.661H7.149l-.3.661a.75.75 0 0 1-.898.408l-.095-.036a.75.75 0 0 1-.372-.993l.5-1.1L7.317 5.69zM5.333 1.75a.75.75 0 1 1 0 1.5h-1.5c-.322 0-.583.261-.583.583v1.5a.75.75 0 1 1-1.5 0v-1.5c0-1.151.933-2.083 2.083-2.083h1.5zm6.833 0c1.151 0 2.083.933 2.083 2.083v1.5a.75.75 0 1 1-1.5 0v-1.5c0-.322-.261-.583-.583-.583h-1.5a.75.75 0 1 1 0-1.5h1.5z" />
                </svg>
              }
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Dropdown, with Properties">
        <RowCards>
          <Card className="h-50" title="Default, Focus, Hover" center>
            <Select
              className="w-44"
              label="X Post"
              value={value2}
              onChange={setValue2}
              options={values}
              isWhite
              icon={
                <svg
                  className="size-4"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                >
                  <path d="M2.5 9.917a.75.75 0 0 1 .75.75v1.5c0 .322.261.583.583.583h1.5a.75.75 0 1 1 0 1.5h-1.5c-1.151 0-2.083-.933-2.083-2.083v-1.5a.75.75 0 0 1 .75-.75zm11 0a.75.75 0 0 1 .75.75v1.5c0 1.151-.933 2.083-2.083 2.083h-1.5a.75.75 0 1 1 0-1.5h1.5c.322 0 .583-.261.583-.583v-1.5a.75.75 0 0 1 .75-.75zM7.317 5.69a.75.75 0 0 1 1.366 0l1.333 2.933.5 1.1a.75.75 0 1 1-1.366.621l-.301-.661H7.149l-.3.661a.75.75 0 0 1-.898.408l-.095-.036a.75.75 0 0 1-.372-.993l.5-1.1L7.317 5.69zM5.333 1.75a.75.75 0 1 1 0 1.5h-1.5c-.322 0-.583.261-.583.583v1.5a.75.75 0 1 1-1.5 0v-1.5c0-1.151.933-2.083 2.083-2.083h1.5zm6.833 0c1.151 0 2.083.933 2.083 2.083v1.5a.75.75 0 1 1-1.5 0v-1.5c0-.322-.261-.583-.583-.583h-1.5a.75.75 0 1 1 0-1.5h1.5z" />
                </svg>
              }
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Dropdown, Simple">
        <RowCards>
          <Card className="h-50" title="Default, Focus, Hover" center>
            <Select
              className="w-44"
              value={value4}
              onChange={setValue4}
              options={values}
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Dropdown, Small">
        <RowCards>
          <Card className="h-50" title="Default, Focus, Hover" center>
            <Select
              value={value5}
              onChange={setValue5}
              options={values}
              isSmall
              isWhite
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Dropdown, Minimal">
        <RowCards>
          <Card className="h-50" title="Default, Focus, Hover, Click" center>
            <Select
              value={value6}
              onChange={setValue6}
              options={values}
              isSmall
              isMinimal
            />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
}

export default DropdownPage;
