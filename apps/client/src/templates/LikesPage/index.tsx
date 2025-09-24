import Catalog from "#components/Catalog";
import Layout from "#components/Layout";

import { content } from "#content";

function LikesPage() {
  return (
    <Layout>
      <Catalog title="Likes" content={content} />
    </Layout>
  );
}

export default LikesPage;
