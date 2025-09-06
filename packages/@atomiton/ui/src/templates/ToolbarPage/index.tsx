import Image from "@/components/Image";
import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import Toolbar from "@/components/Toolbar";
import VideoPlayer from "@/components/VideoPlayer";
import ViewController from "@/components/ViewController";

function ToolbarPage() {
  return (
    <Layout title="Toolbar">
      <Group>
        <RowCards>
          <Card
            className="h-60"
            title="Default, Zoom - View options, Export: On"
            center
          >
            <Toolbar />
          </Card>
          <Card className="h-60" title="Playmode" center>
            <Toolbar playmode />
          </Card>
          <Card className="h-60" title="Default" span={2} center>
            <VideoPlayer />
          </Card>
          <Card className="h-60" title="Repeat" span={2} center>
            <VideoPlayer repeat />
          </Card>
          <Card className="h-88" title="Orbit" span={2} center>
            <ViewController className="!static !translate-0" />
          </Card>
          <Card className="h-88" title="Tilt" span={2} center>
            <ViewController className="!static !translate-0" vertical />
          </Card>
          <Card className="h-88 overflow-hidden" title="Default" center>
            <Image
              className="object-cover"
              src="/images/bg-toolbar.jpg"
              fill
              alt=""
            />
            <VideoPlayer className="relative z-3 w-140" repeat transparent />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
}

export default ToolbarPage;
