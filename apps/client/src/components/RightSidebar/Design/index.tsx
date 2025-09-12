import Artboard from "./Artboard";
import Background from "./Background";
import Camera from "./Camera";
import Materials from "./Materials";
import NodeInspector from "./NodeInspector";
import ShowFrame from "./ShowFrame";
import Styles from "./Styles";

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
