import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { brainwaveTheme } from "@atomiton/theme";
import { App } from "./App";

import "@mantine/core/styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={brainwaveTheme}>
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
