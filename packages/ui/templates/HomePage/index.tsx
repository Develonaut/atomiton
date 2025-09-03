"use client";

import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import Logo from "@/components/Logo";

const HomePage = () => {
  return (
    <Layout title="Branding">
      <Group>
        <RowCards>
          <Card
            className="h-154.5 max-[1419px]:h-80 max-[1023px]:h-60"
            title="Symbol"
            span={3}
            center
          >
            <Logo onlyIcon />
          </Card>
          <Card
            className="h-154.5 max-[1419px]:h-80 max-[1023px]:h-60"
            title="Wordmark"
            span={3}
            center
          >
            <Logo onlyText />
          </Card>
          <Card
            className="h-154.5 max-[1419px]:h-80 max-[1023px]:h-60"
            title="Full"
            span={3}
            center
          >
            <Logo />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default HomePage;
