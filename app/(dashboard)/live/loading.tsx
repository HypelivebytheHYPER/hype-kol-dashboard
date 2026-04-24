export default function LiveLoading() {
  return (
    <div className="flex flex-col gap-6 pb-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-9 w-32 bg-muted rounded" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-full shrink-0" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[9/16] max-h-[480px] bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
