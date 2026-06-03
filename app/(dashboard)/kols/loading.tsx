import { ASPECT, RADIUS } from "@/lib/design-tokens";

export default function KOLsLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-pulse">
      {/* Sidebar skeleton (desktop) */}
      <div className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
        <div className={`h-6 w-32 bg-muted ${RADIUS.sm}`} />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-10 w-full bg-muted ${RADIUS.lg}`} />
          ))}
        </div>
        <div className="h-px bg-border my-2" />
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`h-8 w-full bg-muted ${RADIUS.md}`} />
          ))}
        </div>
      </div>

      {/* Mobile tabs skeleton */}
      <div className="lg:hidden flex items-center gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-9 w-24 bg-muted ${RADIUS.full} shrink-0`} />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Header + Search + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className={`h-10 w-full max-w-md bg-muted ${RADIUS.lg}`} />
          <div className={`h-10 w-36 bg-muted ${RADIUS.lg}`} />
        </div>

        {/* Active filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`h-8 w-20 bg-muted ${RADIUS.full}`} />
          <div className={`h-8 w-24 bg-muted ${RADIUS.full}`} />
        </div>

        {/* Grid of cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className={`${ASPECT.portrait} bg-muted ${RADIUS.xl}`} />
              <div className={`h-4 w-3/4 bg-muted ${RADIUS.sm}`} />
              <div className={`h-3 w-1/2 bg-muted ${RADIUS.sm}`} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className={`h-9 w-9 bg-muted ${RADIUS.md}`} />
          <div className={`h-9 w-9 bg-muted ${RADIUS.md}`} />
          <div className={`h-9 w-9 bg-muted ${RADIUS.md}`} />
        </div>
      </div>
    </div>
  );
}
