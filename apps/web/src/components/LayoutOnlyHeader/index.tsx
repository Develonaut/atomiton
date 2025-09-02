import Header from "./Header";

type Props = {
  classNameHeader?: string;
  children: React.ReactNode;
};

const Layout = ({ classNameHeader, children }: Props) => (
  <div className="pt-20">
    <Header className={classNameHeader} />
    {children}
  </div>
);

export default Layout;
