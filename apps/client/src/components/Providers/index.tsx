"use client";

import { ToastBar, Toaster } from "react-hot-toast";
import Icon from "@/components/Icon";

type Props = {
  children: React.ReactNode;
};

function Providers({ children }: Props) {
  const styles =
    "!p-2 !pr-4 !bg-shade-09 !rounded-full !text-[0.75rem] !font-medium !text-shade-01 !shadow-[0_-4px_12px_0px_rgba(0,0,0,0.15)_inset,0px_0px_4px_1px_rgba(255,255,255,0.25)_inset,0px_29px_12px_0px_rgba(0,0,0,0.02),0px_16px_10px_0px_rgba(0,0,0,0.08),0px_7px_7px_0px_rgba(0,0,0,0.13),0px_2px_4px_0px_rgba(0,0,0,0.15)]";
  return (
    <>
      {children}
      <Toaster
        toastOptions={{
          position: "bottom-center",
          success: {
            className: `${styles}`,
          },
          error: {
            className: `${styles}`,
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t} style={{ ...t.style }}>
            {({ message }) => (
              <>
                <div
                  className={`flex justify-center items-center size-8 rounded-full shadow-[inset_0_0_0_1px_rgba(80,80,80,.95),inset_0_0_0_2px_#1C1C1C] ${
                    t.type === "success" ? "bg-green" : "bg-red"
                  }`}
                >
                  <Icon
                    className="fill-shade-01"
                    name={t.type === "success" ? "check" : "error"}
                  />
                </div>
                {message as React.ReactNode}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </>
  );
}

export default Providers;
