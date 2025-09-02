import React from "react";
import { RouterProvider } from "react-router-dom";
import Providers from "@/components/Providers";
import { router } from "./router";

function App() {
  return (
    <div className="bg-surface-01 font-inter text-body-md text-primary antialiased">
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </div>
  );
}

export default App;
