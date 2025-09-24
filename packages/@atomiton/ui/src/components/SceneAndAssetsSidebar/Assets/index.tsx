import Accordion from "#components/SceneAndAssetsSidebar/Assets/Accordion";

import {
  materials,
  objects3d,
} from "#components/SceneAndAssetsSidebar/Assets/content";

function Assets() {
  return (
    <>
      <Accordion title="3D Objects" items={objects3d} largeImage />
      <Accordion title="Materials" items={materials} />
    </>
  );
}

export default Assets;
