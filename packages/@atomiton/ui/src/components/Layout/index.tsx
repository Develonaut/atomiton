import GuidelineSidebar from "#components/GuidelineSidebar";
import Header from "#components/Layout/Header";
import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

import { content } from "#content";

function Layout({ title, children }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div className="min-h-screen pl-55 pt-20 bg-[#FCFCFC] max-[1023px]:pl-0 max-[767px]:hidden">
        <Header onOpen={() => setVisible(true)} />
        <GuidelineSidebar
          className={`fixed top-0 left-0 bottom-0 !w-55 !min-h-auto max-[1259px]:transition-transform max-[1023px]:z-50 max-[1023px]:!w-65 ${
            visible
              ? "max-[1023px]:translate-x-0"
              : "max-[1023px]:-translate-x-full"
          }`}
          content={content}
          onClose={() => setVisible(false)}
        />
        <div
          className={`hidden fixed inset-0 z-40 bg-[#323232]/40 opacity-0 transition-all duration-300 max-[1023px]:block ${
            visible ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setVisible(false)}
        ></div>
        <div className="">
          <div className="px-12 py-8 border-b border-[#ECECEC] text-[2rem] leading-[2.5rem] max-[1419px]:p-5 max-[1419px]:text-[1.5rem] max-[1419px]:leading-[2rem]">
            {title}
          </div>
          {children}
        </div>
      </div>
      <div className="hidden justify-center items-center h-svh p-5 text-center text-2xl max-[767px]:flex">
        Not available on mobile. <br></br>Please switch to a desktop to view
        this content.
      </div>
    </>
  );
}

export default Layout;
