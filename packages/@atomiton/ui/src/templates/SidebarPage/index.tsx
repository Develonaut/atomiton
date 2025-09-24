import Card from "#components/Card";
import DesignAndAnimationSidebar from "#components/DesignAndAnimationSidebar";
import Group from "#components/Group";
import GuidelineSidebar from "#components/GuidelineSidebar";
import HomeSidebar from "#components/HomeSidebar";
import Layout from "#components/Layout";
import RowCards from "#components/RowCards";
import SceneAndAssetsSidebar from "#components/SceneAndAssetsSidebar";

import { content } from "#content";

function SidebarPage() {
  return (
    <Layout title="Sidebar">
      <Group title="Canvas Sidebar">
        <RowCards>
          <Card
            className="py-16"
            title="Scene, Assets"
            span={2}
            centerHorizontal
            isGray
          >
            <SceneAndAssetsSidebar />
          </Card>
          <Card
            className="py-16"
            title="Design, Animation"
            span={2}
            centerHorizontal
            isGray
          >
            <DesignAndAnimationSidebar />
          </Card>
        </RowCards>
      </Group>
      <Group title="Home Sidebar">
        <RowCards>
          <Card className="py-16" title="Home" span={2} centerHorizontal isGray>
            <HomeSidebar />
          </Card>
          <Card
            className="py-16"
            title="Guideline"
            span={2}
            centerHorizontal
            isGray
          >
            <GuidelineSidebar content={content} />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
}

export default SidebarPage;
