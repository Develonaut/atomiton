import App from "#App";
import { setupGlobalErrorHandlers } from "#utils/globalErrorHandler";
import React from "react";
import ReactDOM from "react-dom/client";
// Import UI theme variables first - must be before ReactFlow styles
import "@atomiton/ui/theme/variables.css";
// Import Vite-compatible CSS with Google Fonts
import "./index.css";
// Import editor styles for ReactFlow nodes - after theme variables
import "@atomiton/editor/index.css";

// Set up global error handlers before rendering
setupGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
