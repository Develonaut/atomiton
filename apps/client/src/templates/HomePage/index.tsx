import Catalog from "#components/Catalog";
import Layout from "#components/Layout";
import Templates from "#components/Templates";
import { useComposites } from "#store/useComposites";
import { titleCase } from "@atomiton/utils";
import { useMemo } from "react";
import { content as fakeContent } from "./content";

function HomePage() {
  const { composites, isLoading } = useComposites();

  const compositesContent = useMemo(
    () =>
      composites.map((composite: { id: string; name: string }) => ({
        id: composite.id,
        title: composite.name,
        category: titleCase("Composite"),
        image: "/images/scenes/12.jpg", // Default image for now
        type: "composite",
      })),
    [composites],
  );

  const combinedContent = useMemo(
    () => [...compositesContent, ...fakeContent],
    [compositesContent],
  );

  return (
    <Layout data-testid="home-page">
      <Templates />
      <Catalog
        title="My Scenes"
        content={combinedContent}
        loading={isLoading}
        data-testid="composite-gallery"
      />
    </Layout>
  );
}

export default HomePage;
