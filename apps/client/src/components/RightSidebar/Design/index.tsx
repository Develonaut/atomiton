import { useNodes } from "@atomiton/editor";
import NodeProperties from "../NodeProperties";
import Artboard from "./Artboard";
import Background from "./Background";
import Camera from "./Camera";
import Materials from "./Materials";
import ShowFrame from "./ShowFrame";
import Styles from "./Styles";

function Design() {
  const { selectedId } = useNodes();

  return (
    <>
      {/* Show node properties at the top when a node is selected */}
      {selectedId && <NodeProperties />}

      {/* Original Design tab content */}
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
