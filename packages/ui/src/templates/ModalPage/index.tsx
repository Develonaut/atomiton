import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import Variations from "@/components/Variations";
import SharePost from "@/components/SharePost";
import ShareProfile from "@/components/ShareProfile";
import ShareFile from "@/components/ShareFile";
import QuickComment from "@/components/QuickComment";
import DeleteFile from "@/components/DeleteFile";
import Export from "@/components/Export";
import Settings from "@/components/Settings";

const ModalPage = () => {
  return (
    <Layout title="Modal, dialogs">
      <Group title="Variations">
        <RowCards>
          <Card className="h-100 bg-[#F8F7F7]" title="Default, Hover" center>
            <Variations />
          </Card>
        </RowCards>
      </Group>
      <Group title="Share">
        <RowCards>
          <Card
            className="py-20 bg-[#F8F7F7]"
            title="Share a post"
            span={2}
            centerHorizontal
          >
            <SharePost />
          </Card>
          <Card
            className="py-20 bg-[#F8F7F7]"
            title="Share profile"
            span={2}
            centerHorizontal
          >
            <ShareProfile />
          </Card>
        </RowCards>
      </Group>
      <Group title="Share file">
        <RowCards>
          <Card className="py-18" title="Share file" center>
            <ShareFile />
          </Card>
        </RowCards>
      </Group>
      <Group title="Quick comment & Delete confirm">
        <RowCards>
          <Card className="py-18 bg-[#F8F7F7]" title="Comment" span={2} center>
            <QuickComment />
          </Card>
          <Card
            className="py-18 bg-[#F8F7F7] max-[1023px]:pt-40"
            title="Confirm"
            span={2}
            center
          >
            <DeleteFile />
          </Card>
        </RowCards>
      </Group>
      <Group title="Export">
        <RowCards>
          <Card
            className="py-12 bg-[#F8F7F7]"
            title="Export images, Export video, Export 3D"
            center
          >
            <Export className="bg-[#FCFCFC] border border-[#ECECEC] rounded-[1.25rem] shadow-2xl" />
          </Card>
        </RowCards>
      </Group>
      <Group title="Settings">
        <RowCards>
          <Card
            className="py-12 bg-[#F8F7F7]"
            title="General, Profile, Security, Notifications, Subscription"
            center
          >
            <Settings />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default ModalPage;
