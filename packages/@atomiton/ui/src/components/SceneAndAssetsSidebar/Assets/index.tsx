import Accordion from "./Accordion";

import { objects3d, materials } from "./content";

function Assets({}) {
  return (
    <>
      <Accordion title="3D Objects" items={objects3d} largeImage />
      <Accordion title="Materials" items={materials} />
    </>
  );
}

export default Assets;
