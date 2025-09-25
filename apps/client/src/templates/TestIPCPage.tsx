import { IPCTest } from "#components/IPCTest";

export default function TestIPCPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">IPC System Test</h1>
        <IPCTest />
      </div>
    </div>
  );
}
