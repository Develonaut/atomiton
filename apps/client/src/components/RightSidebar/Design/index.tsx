import Artboard from "#components/RightSidebar/Design/Artboard";
import Background from "#components/RightSidebar/Design/Background";
import Camera from "#components/RightSidebar/Design/Camera";
import Materials from "#components/RightSidebar/Design/Materials";
import NodeInspector from "#components/RightSidebar/Design/NodeInspector";
import ShowFrame from "#components/RightSidebar/Design/ShowFrame";
import Styles from "#components/RightSidebar/Design/Styles";

function Design() {
  return (
    <>
      <NodeInspector />
      <ShowFrame />
      <Artboard />
      <Materials />
      <Styles />
      <Background />
      <Camera />
    </>
  );
}

export default Design;
