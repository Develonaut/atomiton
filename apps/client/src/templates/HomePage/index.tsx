import Layout from "@/components/Layout";
import Catalog from "@/components/Catalog";

import { content } from "./content";

function HomePage() {
  return (
    <Layout>
      <Catalog title="My Scenes" content={content} />
    </Layout>
  );
}

export default HomePage;
