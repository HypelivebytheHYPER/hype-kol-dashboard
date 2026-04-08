import { Loader2, Video } from "lucide-react";

export default function LiveCatalogLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-20 bg-muted rounded animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="h-10 bg-muted rounded-xl animate-pulse" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className="relative rounded-xl overflow-hidden bg-zinc-900"
          >
            <div className="aspect-[9/16] bg-muted animate-pulse flex items-center justify-center">
              <Video className="w-6 h-6 text-muted-foreground/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
