"use client";

import Image from "next/image";
import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import Button from "@/components/Button";
import SubmitButton from "@/components/SubmitButton";
import Tooltip from "@/components/Tooltip";

const ButtonsPage = () => {
  return (
    <Layout title="Button">
      <Group title="Button, medium">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <Button isPrimary>Button</Button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <Button isPrimary disabled>
              Button
            </Button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Button, medium with icon">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <Button isPrimary>
              <svg
                className="size-5"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M3.152 5.963a.75.75 0 0 1 1.061 1.061l-.648.648c-1.314 1.314-1.314 3.443 0 4.757s3.443 1.314 4.757 0l.643-.643a.75.75 0 0 1 1.061 1.061l-.643.643c-1.899 1.899-4.979 1.899-6.878 0s-1.899-4.979 0-6.878l.648-.648zM9.133 5.8a.75.75 0 0 1 1.061 1.061L6.86 10.194A.75.75 0 0 1 5.8 9.133L9.133 5.8zM6.611 2.504c1.899-1.899 4.979-1.899 6.878 0s1.899 4.979 0 6.878l-.646.646a.75.75 0 0 1-1.061-1.061l.646-.646c1.314-1.314 1.314-3.443 0-4.757s-3.443-1.314-4.757 0l-.644.644a.75.75 0 0 1-1.061-1.061l.644-.644z" />
              </svg>
              Button
            </Button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <Button isPrimary disabled>
              <svg
                className="size-5"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M3.152 5.963a.75.75 0 0 1 1.061 1.061l-.648.648c-1.314 1.314-1.314 3.443 0 4.757s3.443 1.314 4.757 0l.643-.643a.75.75 0 0 1 1.061 1.061l-.643.643c-1.899 1.899-4.979 1.899-6.878 0s-1.899-4.979 0-6.878l.648-.648zM9.133 5.8a.75.75 0 0 1 1.061 1.061L6.86 10.194A.75.75 0 0 1 5.8 9.133L9.133 5.8zM6.611 2.504c1.899-1.899 4.979-1.899 6.878 0s1.899 4.979 0 6.878l-.646.646a.75.75 0 0 1-1.061-1.061l.646-.646c1.314-1.314 1.314-3.443 0-4.757s-3.443-1.314-4.757 0l-.644.644a.75.75 0 0 1-1.061-1.061l.644-.644z" />
              </svg>
              Button
            </Button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Button, small">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <Button isPrimary isSmall>
              Button
            </Button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <Button isPrimary isSmall disabled>
              Button
            </Button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Button, small with icon">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <Button isPrimary isSmall>
              <svg
                className="size-5"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M3.152 5.963a.75.75 0 0 1 1.061 1.061l-.648.648c-1.314 1.314-1.314 3.443 0 4.757s3.443 1.314 4.757 0l.643-.643a.75.75 0 0 1 1.061 1.061l-.643.643c-1.899 1.899-4.979 1.899-6.878 0s-1.899-4.979 0-6.878l.648-.648zM9.133 5.8a.75.75 0 0 1 1.061 1.061L6.86 10.194A.75.75 0 0 1 5.8 9.133L9.133 5.8zM6.611 2.504c1.899-1.899 4.979-1.899 6.878 0s1.899 4.979 0 6.878l-.646.646a.75.75 0 0 1-1.061-1.061l.646-.646c1.314-1.314 1.314-3.443 0-4.757s-3.443-1.314-4.757 0l-.644.644a.75.75 0 0 1-1.061-1.061l.644-.644z" />
              </svg>
              Button
            </Button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <Button isPrimary isSmall disabled>
              <svg
                className="size-5"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M3.152 5.963a.75.75 0 0 1 1.061 1.061l-.648.648c-1.314 1.314-1.314 3.443 0 4.757s3.443 1.314 4.757 0l.643-.643a.75.75 0 0 1 1.061 1.061l-.643.643c-1.899 1.899-4.979 1.899-6.878 0s-1.899-4.979 0-6.878l.648-.648zM9.133 5.8a.75.75 0 0 1 1.061 1.061L6.86 10.194A.75.75 0 0 1 5.8 9.133L9.133 5.8zM6.611 2.504c1.899-1.899 4.979-1.899 6.878 0s1.899 4.979 0 6.878l-.646.646a.75.75 0 0 1-1.061-1.061l.646-.646c1.314-1.314 1.314-3.443 0-4.757s-3.443-1.314-4.757 0l-.644.644a.75.75 0 0 1-1.061-1.061l.644-.644z" />
              </svg>
              Button
            </Button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Call to action">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <Button isSecondary>Button</Button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <Button isSecondary disabled>
              Button
            </Button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Warning button">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <Button isOrange>Button</Button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <Button isOrange disabled>
              Button
            </Button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Small Icon Button">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <Button isPrimary>
              <Image
                src="/images/google.svg"
                width={24}
                height={24}
                alt="Google"
              />
              Sign in with Google
            </Button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <Button isPrimary disabled>
              <Image
                src="/images/google.svg"
                width={24}
                height={24}
                alt="Google"
              />
              Sign in with Google
            </Button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Ghost Icon Button">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <button className="flex justify-center items-center size-10 border border-[#E2E2E2] bg-[#FCFCFC] rounded-xl cursor-pointer transition-all hover:bg-[#F1F1F1] active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10)_inset]">
              <svg
                className="size-4"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M2.63 2.63a.75.75 0 0 1 1.061 0l4.303 4.303 4.303-4.303a.75.75 0 0 1 .977-.073l.084.073a.75.75 0 0 1 0 1.061L9.054 7.993l4.303 4.303a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0L7.993 9.054 3.69 13.357a.75.75 0 0 1-.977.073l-.084-.073a.75.75 0 0 1 0-1.061l4.303-4.303L2.63 3.69a.75.75 0 0 1-.073-.977l.073-.084z" />
              </svg>
            </button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <button className="flex justify-center items-center size-10 border border-[#E2E2E2] bg-[#FCFCFC] rounded-xl cursor-pointer transition-all hover:bg-[#F1F1F1] active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10)_inset] opacity-50 pointer-events-none">
              <svg
                className="size-4"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M2.63 2.63a.75.75 0 0 1 1.061 0l4.303 4.303 4.303-4.303a.75.75 0 0 1 .977-.073l.084.073a.75.75 0 0 1 0 1.061L9.054 7.993l4.303 4.303a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0L7.993 9.054 3.69 13.357a.75.75 0 0 1-.977.073l-.084-.073a.75.75 0 0 1 0-1.061l4.303-4.303L2.63 3.69a.75.75 0 0 1-.073-.977l.073-.084z" />
              </svg>
            </button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Large Icon Button">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <button className="flex justify-center items-center size-9 rounded-[0.625rem] cursor-pointer transition-all hover:bg-[#F1F1F1] active:shadow-[0px_0px_2.1px_0px_rgba(0,0,0,0.15)_inset]">
              <svg
                className="size-5 fill-[#7B7B7B]"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M10.005 2.38a.75.75 0 0 1 .75.75v6.125h6.125a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.75.75h-6.125v6.125a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75v-6.125H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h6.125V3.13a.75.75 0 0 1 .648-.743l.102-.007z" />
              </svg>
            </button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <button className="flex justify-center items-center size-9 rounded-[0.625rem] cursor-pointer transition-all hover:bg-[#F1F1F1] active:shadow-[0px_0px_2.1px_0px_rgba(0,0,0,0.15)_inset] opacity-50 pointer-events-none">
              <svg
                className="size-5 fill-[#7B7B7B]"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M10.005 2.38a.75.75 0 0 1 .75.75v6.125h6.125a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.75.75h-6.125v6.125a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75v-6.125H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h6.125V3.13a.75.75 0 0 1 .648-.743l.102-.007z" />
              </svg>
            </button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Small Icon Button">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <button className="flex justify-center items-center size-6 rounded-lg cursor-pointer transition-all hover:bg-[#F1F1F1] active:shadow-[0px_0px_2.1px_0px_rgba(0,0,0,0.15)_inset]">
              <svg
                className="size-4 fill-[#7B7B7B]"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M8 3.25a.75.75 0 0 1 .75.75v3.249L12 7.25a.75.75 0 0 1 .743.648L12.75 8a.75.75 0 0 1-.75.75l-3.25-.001V12a.75.75 0 0 1-.648.743L8 12.75a.75.75 0 0 1-.75-.75V8.749L4 8.75a.75.75 0 0 1-.743-.648L3.25 8A.75.75 0 0 1 4 7.25l3.25-.001V4a.75.75 0 0 1 .648-.743L8 3.25z" />
              </svg>
            </button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <button className="flex justify-center items-center size-6 rounded-lg cursor-pointer transition-all hover:bg-[#F1F1F1] active:shadow-[0px_0px_2.1px_0px_rgba(0,0,0,0.15)_inset] opacity-50 pointer-events-none">
              <svg
                className="size-4 fill-[#7B7B7B]"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M8 3.25a.75.75 0 0 1 .75.75v3.249L12 7.25a.75.75 0 0 1 .743.648L12.75 8a.75.75 0 0 1-.75.75l-3.25-.001V12a.75.75 0 0 1-.648.743L8 12.75a.75.75 0 0 1-.75-.75V8.749L4 8.75a.75.75 0 0 1-.743-.648L3.25 8A.75.75 0 0 1 4 7.25l3.25-.001V4a.75.75 0 0 1 .648-.743L8 3.25z" />
              </svg>
            </button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Like Button">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <button className="flex justify-center items-center gap-2 h-11 px-3.5 border border-[#E2E2E2] rounded-xl text-[0.75rem] leading-[1rem] font-semibold cursor-pointer transition-all hover:bg-[#F8F7F7] active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)_inset] active:bg-[#FCFCFC]">
              <svg
                className="size-4 fill-[#FE5938]"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M10.137 3.308c2.84-2.175 6.607-1.109 7.907 2.139 1.535 3.836-1.049 8.561-7.68 12.287a.75.75 0 0 1-.735 0C2.998 14.009.415 9.283 1.949 5.447c1.299-3.248 5.067-4.313 7.907-2.139l.14.111.141-.111zm6.514 2.696c-1.01-2.524-4.008-3.194-6.12-1.046a.75.75 0 0 1-1.069 0C7.35 2.81 4.352 3.48 3.342 6.004c-1.164 2.91.818 6.726 6.354 10.035l.3.176.301-.176c5.428-3.245 7.439-6.976 6.419-9.863l-.065-.172z" />
              </svg>
              200
            </button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <button className="flex justify-center items-center gap-2 h-11 px-3.5 border border-[#E2E2E2] rounded-xl text-[0.75rem] leading-[1rem] font-semibold cursor-pointer transition-all hover:bg-[#F8F7F7] active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)_inset] active:bg-[#FCFCFC] opacity-50 pointer-events-none">
              <svg
                className="size-4 fill-[#FE5938]"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M10.137 3.308c2.84-2.175 6.607-1.109 7.907 2.139 1.535 3.836-1.049 8.561-7.68 12.287a.75.75 0 0 1-.735 0C2.998 14.009.415 9.283 1.949 5.447c1.299-3.248 5.067-4.313 7.907-2.139l.14.111.141-.111zm6.514 2.696c-1.01-2.524-4.008-3.194-6.12-1.046a.75.75 0 0 1-1.069 0C7.35 2.81 4.352 3.48 3.342 6.004c-1.164 2.91.818 6.726 6.354 10.035l.3.176.301-.176c5.428-3.245 7.439-6.976 6.419-9.863l-.065-.172z" />
              </svg>
              200
            </button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Toolbar Button">
        <RowCards>
          <Card className="h-50" title="Default, Hover" span={3} center>
            <button className="flex justify-center items-center size-10 border border-transparent rounded-xl cursor-pointer transition-all hover:bg-[#F1F1F1]">
              <svg
                className="size-5"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M1.933 4.477C1.388 2.9 2.9 1.388 4.477 1.933l12.361 4.272c1.742.602 1.812 3.04.107 3.74l-4.768 1.959a.5.5 0 0 0-.273.273l-1.959 4.768c-.7 1.705-3.138 1.635-3.74-.107L1.933 4.477zm2.054-1.126a.5.5 0 0 0-.636.636l4.272 12.361a.5.5 0 0 0 .935.027l1.959-4.768a2 2 0 0 1 1.09-1.09l4.768-1.959a.5.5 0 0 0-.027-.935L3.987 3.351z" />
              </svg>
            </button>
          </Card>
          <Card className="h-50" title="Disabled" span={3} center>
            <button className="flex justify-center items-center size-10 border border-transparent rounded-xl cursor-pointer transition-all hover:bg-[#F1F1F1] opacity-40 pointer-events-none">
              <svg
                className="size-5"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M1.933 4.477C1.388 2.9 2.9 1.388 4.477 1.933l12.361 4.272c1.742.602 1.812 3.04.107 3.74l-4.768 1.959a.5.5 0 0 0-.273.273l-1.959 4.768c-.7 1.705-3.138 1.635-3.74-.107L1.933 4.477zm2.054-1.126a.5.5 0 0 0-.636.636l4.272 12.361a.5.5 0 0 0 .935.027l1.959-4.768a2 2 0 0 1 1.09-1.09l4.768-1.959a.5.5 0 0 0-.027-.935L3.987 3.351z" />
              </svg>
            </button>
          </Card>
          <Card className="h-50" title="Active" span={3} center>
            <button className="flex justify-center items-center size-10 border border-[#E2E2E2] rounded-xl bg-[#F1F1F1] shadow-[0px_-1px_3px_0px_rgba(18,18,18,0.15)_inset,0px_1.25px_1px_0px_#FFF_inset] cursor-pointer transition-all hover:bg-[#F1F1F1]">
              <svg
                className="size-5"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d="M1.933 4.477C1.388 2.9 2.9 1.388 4.477 1.933l12.361 4.272c1.742.602 1.812 3.04.107 3.74l-4.768 1.959a.5.5 0 0 0-.273.273l-1.959 4.768c-.7 1.705-3.138 1.635-3.74-.107L1.933 4.477zm2.054-1.126a.5.5 0 0 0-.636.636l4.272 12.361a.5.5 0 0 0 .935.027l1.959-4.768a2 2 0 0 1 1.09-1.09l4.768-1.959a.5.5 0 0 0-.027-.935L3.987 3.351z" />
              </svg>
            </button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Like Comment">
        <RowCards>
          <Card
            className="h-50"
            title="Default, Hover, Press, Focus"
            span={2}
            center
          >
            <button className="flex justify-center items-center gap-2 h-7 px-2 border border-[#E2E2E2] rounded-lg text-[0.8125rem] leading-[1rem] font-semibold cursor-pointer transition-all hover:bg-[#F8F7F7] active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)_inset] active:bg-[#F8F7F7]">
              👍 <span>2</span>
            </button>
          </Card>
          <Card className="h-50" title="Disabled" span={2} center>
            <button className="flex justify-center items-center gap-2 h-7 px-2 border border-[#E2E2E2] rounded-lg text-[0.8125rem] leading-[1rem] font-semibold cursor-pointer transition-all hover:bg-[#F8F7F7] active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)_inset] active:bg-[#F8F7F7] opacity-40 pointer-events-none">
              👍 <span>2</span>
            </button>
          </Card>
        </RowCards>
      </Group>
      <Group title="Submit Button">
        <RowCards>
          <Card className="h-50" title="Default, Hover, Focus" span={3} center>
            <SubmitButton />
          </Card>
          <Card className="h-50" title="Disabled" span={3} center>
            <SubmitButton disabled />
          </Card>
          <Card className="h-50" title="Active" span={3} center>
            <SubmitButton active />
          </Card>
        </RowCards>
      </Group>
      <Group title="Tooltip">
        <RowCards>
          <Card className="h-50" title="Text" center>
            <Tooltip>Copy prompt</Tooltip>
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default ButtonsPage;
