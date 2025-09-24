import { ImageGrid } from "#components/form";
import { useState } from "react";
import Group from "./../Group";

import { content } from "#content";

function Materials() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Group title="Materials">
      <ImageGrid
        items={content}
        activeIndex={activeIndex}
        onSelectionChange={setActiveIndex}
        imageSize={64}
        columns={2}
      />
    </Group>
  );
}

export default Materials;
