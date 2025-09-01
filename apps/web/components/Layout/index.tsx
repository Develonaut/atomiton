import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="pl-55 pt-20 max-lg:pl-0">
      <Header onOpen={() => setVisible(true)} />
      <Sidebar visible={visible} onClose={() => setVisible(false)} />
      <div
        className={`hidden fixed inset-0 z-40 bg-shade-07/40 opacity-0 transition-all duration-300 max-lg:block ${
          visible ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setVisible(false)}
      ></div>
      {children}
    </div>
  );
};

export default Layout;
