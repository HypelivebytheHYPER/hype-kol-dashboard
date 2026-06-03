import { ASPECT, WIDTH, HERO, RADIUS } from "@/lib/design-tokens";

export default function HypeStudioLoading() {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      {/* Hero section skeleton */}
      <section className={`relative ${HERO.height} flex flex-col justify-end overflow-hidden`}>
        <div className="absolute inset-0 bg-muted" />
        <div className="relative z-10 p-6 md:p-12 lg:p-20 pb-24">
          <div className={`h-12 w-3/4 max-w-xl bg-muted-foreground/20 ${RADIUS.lg} mb-6`} />
          <div className={`h-6 w-1/2 max-w-md bg-muted-foreground/20 ${RADIUS.md} mb-8`} />
          <div className="flex gap-3">
            <div className={`h-12 w-36 bg-muted-foreground/20 ${RADIUS.lg}`} />
            <div className={`h-12 w-36 bg-muted-foreground/20 ${RADIUS.lg}`} />
          </div>
        </div>
      </section>

      {/* Featured studio section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 md:mb-24">
          <div className="flex flex-col gap-4">
            <div className={`h-8 w-48 bg-muted ${RADIUS.lg}`} />
            <div className={`h-4 w-full bg-muted ${RADIUS.md}`} />
            <div className={`h-4 w-5/6 bg-muted ${RADIUS.md}`} />
            <div className={`h-4 w-4/6 bg-muted ${RADIUS.md}`} />
          </div>
          <div className={`${ASPECT.wide} bg-muted ${RADIUS["2xl"]}`} />
        </div>

        {/* Stats grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-px bg-border/30 ${RADIUS["2xl"]} overflow-hidden`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-background p-8 md:p-10 flex flex-col items-center text-center gap-3">
              <div className={`h-10 w-24 bg-muted ${RADIUS.lg}`} />
              <div className={`h-4 w-32 bg-muted ${RADIUS.md}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Studios section */}
      <section className="py-16 md:py-24">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div className={`h-8 w-40 bg-muted ${RADIUS.lg}`} />
            <div className={`h-10 w-32 bg-muted ${RADIUS.lg}`} />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden px-6 md:px-12 lg:px-20 pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`shrink-0 ${WIDTH.studioCard}`}>
              <div className={`${ASPECT.portrait} bg-muted ${RADIUS.xl} mb-3`} />
              <div className={`h-5 w-3/4 bg-muted ${RADIUS.md}`} />
              <div className={`h-4 w-1/2 bg-muted ${RADIUS.sm} mt-2`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
