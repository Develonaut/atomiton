import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Providers from "./components/Providers";
import { router } from "./router";
import { errorReporter } from "./utils/errorReporting";

function AppContent() {
  return (
    <div className="bg-surface-01 font-inter text-body-md text-primary antialiased">
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary onError={errorReporter.handleError.bind(errorReporter)}>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
