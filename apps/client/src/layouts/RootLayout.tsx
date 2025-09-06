import type { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";

function RootLayout({ children }: PropsWithChildren) {
  return (
    <Layout>
      <Outlet />
      {children}
    </Layout>
  );
}

export default RootLayout;
