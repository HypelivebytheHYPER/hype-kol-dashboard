import { Skeleton } from "@/components/ui/skeleton";

export function LoadingDashboard() {
  return (
    <div className="space-y-10">
      {/* Hero Loading */}
      <section className="rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-background border p-8 sm:p-12">
        <div className="max-w-2xl space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </section>

      {/* Categories Loading */}
      <section>
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Featured Loading */}
      <section>
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-[280px] rounded-xl flex-shrink-0" />
          ))}
        </div>
      </section>
    </div>
  );
}
