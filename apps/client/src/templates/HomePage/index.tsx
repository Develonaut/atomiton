import Catalog from "@/components/Catalog";
import Layout from "@/components/Layout";
import Templates from "@/components/Templates";
import { useUserBlueprints } from "@/stores/blueprint/hooks";
import { titleCase } from "@atomiton/utils";
import { useMemo } from "react";
import { content as fakeContent } from "./content";

function HomePage() {
  const { blueprints, isLoading } = useUserBlueprints();
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
    <Layout data-testid="home-page">
      <Templates />
      <Catalog
        title="My Scenes"
        content={combinedContent}
        loading={isLoading}
        data-testid="blueprint-gallery"
      />
    </Layout>
  );
}

export default HomePage;
