import App from "#App";

import React from "react";
import ReactDOM from "react-dom/client";
// Import UI theme variables first - must be before ReactFlow styles
import "@atomiton/ui/theme/variables.css";
// Import Vite-compatible CSS with Google Fonts
import "#index.css";
// Import editor styles for ReactFlow nodes - after theme variables
import { logger } from "#services/logger";
import "@atomiton/editor/index.css";

logger.info("Atomiton Client starting", {
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString(),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
