import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import Zoom from "@/components/Zoom";
import FileMenu from "@/components/FileMenu";
import Folders from "@/components/Folders";
import SelectAI from "@/components/SelectAI";
import Upload from "@/components/Upload";
import FiltersMenu from "@/components/FiltersMenu";
import ProfileMenu from "@/components/ProfileMenu";

function MenuPage() {
  return (
    <Layout title="Menu">
      <Group>
        <RowCards>
          <Card
            className="min-h-121.5 pt-20 pb-16"
            title="Zoom view options"
            span={3}
            centerHorizontal
          >
            <Zoom className="w-51 rounded-2xl bg-[#FCFCFC] border border-[#ECECEC] shadow-2xl" />
          </Card>
          <Card
            className="min-h-121.5 pt-20 pb-16"
            title="File menu"
            span={3}
            centerHorizontal
          >
            <FileMenu />
          </Card>
          <Card
            className="min-h-121.5 pt-20 pb-16"
            title="File menu"
            span={3}
            centerHorizontal
          >
            <Folders />
          </Card>
          <Card
            className="min-h-121.5 pt-20 pb-16"
            title="Select AI model"
            span={3}
            centerHorizontal
          >
            <SelectAI />
          </Card>
          <Card
            className="min-h-121.5 pt-20 pb-16"
            title="Upload"
            span={3}
            centerHorizontal
          >
            <Upload />
          </Card>
          <Card
            className="min-h-121.5 pt-20 pb-16"
            title="Filter menu"
            span={3}
            centerHorizontal
          >
            <FiltersMenu />
          </Card>
          <Card
            className="min-h-121.5 pt-20 pb-16"
            title="Profile menu"
            span={3}
            centerHorizontal
          >
            <ProfileMenu />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
}

export default MenuPage;
