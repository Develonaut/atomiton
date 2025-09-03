"use client";

import Layout from "@/components/Layout";
import Catalog from "@/components/Catalog";

import { content } from "./content";

const LikesPage = () => {
  return (
    <Layout>
      <Catalog title="Likes" content={content} />
    </Layout>
  );
};

export default LikesPage;
