import Gallery from "#components/Gallery";
import Layout from "#components/Layout";
import PanelMessage from "#components/PanelMessage";
import Projects from "#components/Projects";

import { gallery, projects } from "#templates/Explore/AnimationsPage/content";

function AnimationsPage() {
  return (
    <Layout>
      <Projects projects={projects} />
      <Gallery
        className="px-12 pb-8 max-2xl:px-5"
        gallery={gallery}
        config={{
          columns: [1, 2, 3, 4, 5],
          gap: [12, 12, 12, 12, 12],
          media: [767, 1179, 1680, 2120, 2600],
        }}
      />
      <PanelMessage className="!bottom-5 left-[calc(50%+6.875rem)] max-md:hidden" />
    </Layout>
  );
}

export default AnimationsPage;
