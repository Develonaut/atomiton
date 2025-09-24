import Layout from "./components/Layout";

function RootLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default RootLayout;
