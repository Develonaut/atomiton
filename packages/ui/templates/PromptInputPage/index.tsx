"use client";

import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import PromptInput from "@/components/PromptInput";

const PromptInputPage = () => {
  return (
    <Layout title="Prompt Input">
      <Group>
        <RowCards>
          <Card
            className="h-100"
            title="Default, Hover, Voice Input, Upload, Select AI Model"
            center
          >
            <PromptInput />
          </Card>
          <Card
            className="pt-85 pb-12"
            title="Collapsed, Premade Prompt"
            centerHorizontal
          >
            <PromptInput collapsed premadePrompt />
          </Card>
          <Card className="h-100" title="Prompt box with Toolbar" center>
            <PromptInput isViewController />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default PromptInputPage;
