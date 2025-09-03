"use client";

import Layout from "@/components/Layout";
import Catalog from "@/components/Catalog";

import { content } from "./content";

const HomePage = () => {
  return (
    <Layout>
      <Catalog title="My Scenes" content={content} />
    </Layout>
  );
};

export default HomePage;
