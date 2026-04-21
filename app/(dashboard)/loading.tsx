export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-muted rounded animate-pulse" />
      </div>

      {/* Content area skeleton */}
      <div className="h-10 bg-muted rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
