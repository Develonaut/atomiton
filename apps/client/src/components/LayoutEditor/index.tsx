import Comments from "@/components/Comments";
import Image from "@/components/Image";
import LeftSidebar from "@/components/LeftSidebar";
import PanelMessage from "@/components/PanelMessage";
import ResizeImage from "@/components/ResizeImage";
import RightSidebar from "@/components/RightSidebar";
import Toolbar from "@/components/Toolbar";
import useStore from "@/store";

function LayoutEditor() {
  const { isVisibleComments, isResizeImage } = useStore((state) => state);
  const image = "/images/robot.png";

  return (
    <div className="min-h-screen px-66 bg-surface-02">
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
  );
}

export default LayoutEditor;
