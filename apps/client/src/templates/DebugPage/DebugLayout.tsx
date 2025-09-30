import Layout from "#components/Layout";
import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { Link, Outlet } from "@atomiton/router";

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

        {/* Debug Navigation */}
        <nav className="flex gap-2 mb-6 flex-wrap">
          <Link
            to="/debug/nodes"
            activeOptions={{ exact: false }}
            className="px-4 py-2 rounded hover:bg-gray-100"
            activeProps={{
              className: "px-4 py-2 rounded bg-blue-600 text-white",
            }}
            data-testid="nav-nodes"
          >
            🎯 Nodes
          </Link>
          <Link
            to="/debug/system"
            activeOptions={{ exact: false }}
            className="px-4 py-2 rounded hover:bg-gray-100"
            activeProps={{
              className: "px-4 py-2 rounded bg-blue-600 text-white",
            }}
            data-testid="nav-system"
          >
            ⚙️ System
          </Link>
          <Link
            to="/debug/flows"
            activeOptions={{ exact: false }}
            className="px-4 py-2 rounded hover:bg-gray-100"
            activeProps={{
              className: "px-4 py-2 rounded bg-blue-600 text-white",
            }}
            data-testid="nav-flows"
          >
            📊 Flows
          </Link>
          <Link
            to="/debug/auth"
            activeOptions={{ exact: false }}
            className="px-4 py-2 rounded hover:bg-gray-100"
            activeProps={{
              className: "px-4 py-2 rounded bg-blue-600 text-white",
            }}
            data-testid="nav-auth"
          >
            🔒 Auth
          </Link>
          <Link
            to="/debug/environment"
            activeOptions={{ exact: false }}
            className="px-4 py-2 rounded hover:bg-gray-100"
            activeProps={{
              className: "px-4 py-2 rounded bg-blue-600 text-white",
            }}
            data-testid="nav-environment"
          >
            🌍 Environment
          </Link>
        </nav>

        {/* Main Content Area */}
        <Outlet />

        {/* Event Logs Section (Shared across all pages) */}
        <LogsSection />
      </div>
    </Layout>
  );
}
