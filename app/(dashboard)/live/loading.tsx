import { MAX_HEIGHT, RADIUS, ASPECT } from "@/lib/design-tokens";

export default function LiveLoading() {
  return (
    <div className="flex flex-col gap-6 pb-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className={`h-8 w-48 bg-muted ${RADIUS.sm}`} />
        <div className={`h-9 w-32 bg-muted ${RADIUS.sm}`} />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-8 w-24 bg-muted ${RADIUS.full} shrink-0`} />
        ))}
      </div>

      {/* Grid skeleton — match MCCard aspect-[9/16] */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`${ASPECT.video} ${MAX_HEIGHT.card} bg-muted ${RADIUS.lg}`} />
        ))}
      </div>
    </div>
  );
}
