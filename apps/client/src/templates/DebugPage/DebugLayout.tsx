import Layout from "#components/Layout";
import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { Outlet } from "@atomiton/router";

export default function DebugLayout() {
  return (
    <Layout>
      <div className="p-8 h-full overflow-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            data-testid="debug-page-title"
          >
            Conductor Debug Page
          </h1>
          <p className="text-gray-600">
            Test and debug the Conductor API integration
          </p>
        </div>

        {/* Main Content Area */}
        <Outlet />

        {/* Event Logs Section (Shared across all pages) */}
        <LogsSection />
      </div>
    </Layout>
  );
}
