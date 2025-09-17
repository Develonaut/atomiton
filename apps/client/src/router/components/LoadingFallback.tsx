export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-02">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Spinner */}
          <div className="w-12 h-12 rounded-full border-3 border-surface-01 border-t-primary animate-spin" />
        </div>
        <p className="text-secondary text-body-md">Loading...</p>
      </div>
    </div>
  );
}
