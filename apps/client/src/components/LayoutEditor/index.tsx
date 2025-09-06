import LeftSidebar from "@/components/LeftSidebar";
import Toolbar from "@/components/Toolbar";
import PanelMessage from "@/components/PanelMessage";
import RightSidebar from "@/components/RightSidebar";
import Button from "@/components/Button";
import ResizeImage from "@/components/ResizeImage";
import Comments from "@/components/Comments";
import Image from "@/components/Image";
import useStore from "@/store";

function LayoutEditor() {
  const { isVisibleComments, isResizeImage } = useStore((state) => state);
  const image = "/images/robot.png";

  return (
    <>
      <div className="min-h-screen px-66 bg-surface-02 max-[1340px]:hidden">
        <LeftSidebar />
        <Toolbar />
        {isVisibleComments && <Comments />}
        {isResizeImage ? (
          <ResizeImage image={image} />
        ) : (
          <div className="fixed inset-0 ml-63 mr-63 z-1">
            <Image className="object-cover" src={image} fill alt="home" />
          </div>
        )}
        <PanelMessage isViewController />
        <RightSidebar />
      </div>
      <div className="hidden fixed inset-0 flex-col justify-center items-center gap-4 p-5 text-center max-[1340px]:flex">
        <div className="text-h5">
          The editor is only available for desktop versions
        </div>
        <Button isPrimary as="link" href="/">
          Go to home
        </Button>
      </div>
    </>
  );
}

export default LayoutEditor;
