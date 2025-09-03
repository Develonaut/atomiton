"use client";

import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import HeaderSimple from "@/components/HeaderSimple";
import HeaderAsset from "@/components/HeaderAsset";
import HeaderMinimal from "@/components/HeaderMinimal";

const TopbarPage = () => {
  return (
    <Layout title="Topbar">
      <Group>
        <RowCards>
          <Card className="px-10 py-20" title="Simple" center isGray>
            <HeaderSimple className="w-full" />
          </Card>
          <Card className="px-10 py-20" title="Asset" center isGray>
            <HeaderAsset />
          </Card>
          <Card className="px-10 py-20" title="Minimal" center isGray>
            <HeaderMinimal />
          </Card>
          <Card
            className="px-10 py-20"
            title="Simple with Filter"
            center
            isGray
          >
            <HeaderSimple className="w-full" isFilters />
          </Card>
          <Card className="px-10 py-20" title="Show search" center isGray>
            <HeaderSimple className="w-full" isShowSearch />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default TopbarPage;
