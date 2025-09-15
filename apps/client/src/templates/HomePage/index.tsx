import Catalog from "@/components/Catalog";
import Layout from "@/components/Layout";
import { useBlueprints } from "@/stores/blueprint/hooks";
import { titleCase } from "@atomiton/utils";
import { useMemo } from "react";
import { content as fakeContent } from "./content";

function HomePage() {
  const { blueprints, isLoading } = useBlueprints();
  const blueprintsContent = useMemo(
    () =>
      blueprints.map((blueprint) => ({
        id: blueprint.id,
        title: blueprint.name,
        category: titleCase(blueprint.metadata?.category || "Blueprint"),
        image: "/images/scenes/12.jpg", // Default image for now
        type: "blueprint",
      })),
    [blueprints],
  );

  const combinedContent = useMemo(
    () => [...blueprintsContent, ...fakeContent],
    [blueprintsContent],
  );

  return (
    <Layout>
      <Catalog
        title="My Scenes"
        content={combinedContent}
        loading={isLoading}
      />
    </Layout>
  );
}

export default HomePage;
