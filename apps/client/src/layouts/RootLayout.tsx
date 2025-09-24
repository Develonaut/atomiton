import Layout from "#layouts/components/Layout";

function RootLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default RootLayout;
