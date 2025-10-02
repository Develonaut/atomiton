import Layout from "#components/Layout";
import { Outlet } from "@atomiton/router";

export default function DebugLayout() {
  return (
    <Layout>
      <div className="p-8 h-full flex flex-col overflow-hidden">
        <div className="mb-8 shrink-0">
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
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
}
