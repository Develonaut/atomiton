import Header from "#components/LayoutOnlyHeader/Header";

type Props = {
  classNameHeader?: string;
  children: React.ReactNode;
};

function Layout({ classNameHeader, children }: Props) {
  return (
    <div className="pt-20">
      <Header className={classNameHeader} />
      {children}
    </div>
  );
}

export default Layout;
