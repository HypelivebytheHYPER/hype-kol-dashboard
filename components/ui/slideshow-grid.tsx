"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { RADIUS, SHADOW, Z_INDEX } from "@/lib/design-tokens";
import { SLIDESHOW_RECALC_DELAY_MS } from "@/lib/constants";

interface SlideshowGridProps {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showCounter?: boolean;
  showDetail?: boolean;
}

/** Responsive horizontal slideshow / carousel.
 *  Uses native CSS scroll-snap for smooth touch/mouse scrolling.
 *  Cards are placed in flex rows; each row is one snap target. */
export function SlideshowGrid({
  children,
  className,
  gap = 16,
  showArrows = true,
  showDots = true,
  showCounter = true,
  showDetail,
}: SlideshowGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const items = useMemo(() => {
    return Array.isArray(children) ? children : [children];
  }, [children]);

  // Compute responsive slides-per-view based on container width
  const computeSlidesPerView = useCallback((width: number) => {
    if (width < 480) return 1.5; // peek next card on mobile
    if (width < 640) return 2;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  }, []);

  // Recalculate layout on resize (debounced with RAF to avoid transition jitter)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf: number;

    const update = () => {
      const width = el.clientWidth;
      const spv = computeSlidesPerView(width);
      setSlidesPerView(spv);

      const total = Math.ceil(items.length / Math.floor(spv));
      setTotalSlides(total);

      // Check scrollability
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };

    const debouncedUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();

    const ro = new ResizeObserver(debouncedUpdate);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [items.length, computeSlidesPerView]);

  // Recalculate after detail panel transition settles (replaces key remount hack)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      const width = el.clientWidth;
      const spv = computeSlidesPerView(width);
      setSlidesPerView(spv);

      const total = Math.ceil(items.length / Math.floor(spv));
      setTotalSlides(total);

      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }, SLIDESHOW_RECALC_DELAY_MS);

    return () => clearTimeout(timer);
  }, [showDetail, items.length, computeSlidesPerView]);

  // Update arrow visibility on scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);

      // Approximate current slide from scroll position
      const slideWidth = el.clientWidth;
      const idx = Math.round(el.scrollLeft / slideWidth);
      setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [totalSlides]);

  const scrollBy = useCallback(
    (direction: number) => {
      const el = containerRef.current;
      if (!el) return;
      const slideWidth = el.clientWidth;
      el.scrollBy({ left: direction * slideWidth, behavior: "smooth" });
    },
    []
  );

  const goToSlide = useCallback(
    (idx: number) => {
      const el = containerRef.current;
      if (!el) return;
      const slideWidth = el.clientWidth;
      el.scrollTo({ left: idx * slideWidth, behavior: "smooth" });
    },
    []
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollBy(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollBy(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollBy]);

  // Build rows (slides) of N cards each
  const rows = useMemo(() => {
    const perRow = Math.max(1, Math.floor(slidesPerView));
    const result: React.ReactNode[][] = [];
    for (let i = 0; i < items.length; i += perRow) {
      result.push(items.slice(i, i + perRow));
    }
    return result;
  }, [items, slidesPerView]);

  const slideGap = gap;

  return (
    <div className={cn("relative group", className)}>
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex shrink-0 snap-start"
            style={{
              width: "100%",
              paddingRight: rowIdx < rows.length - 1 ? `${slideGap}px` : undefined,
            }}
          >
            {row.map((child, colIdx) => {
              const isLastInRow = colIdx === row.length - 1;
              return (
                <div
                  key={colIdx}
                  className="shrink-0 min-w-[200px]"
                  style={{
                    width: `calc((100% - ${(row.length - 1) * slideGap}px) / ${row.length})`,
                    marginRight: isLastInRow ? 0 : `${slideGap}px`,
                  }}
                >
                  {child}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            className={cn(
              `absolute left-2 top-1/2 -translate-y-1/2 ${Z_INDEX.content}`,
              `size-8 ${RADIUS.full} bg-background/80 backdrop-blur-md border border-border/50`,
              "items-center justify-center",
              `${SHADOW.md}`,
              "transition-transform active:scale-90",
              "hidden lg:flex lg:opacity-0 lg:group-hover:opacity-100",
              canScrollLeft
                ? "pointer-events-auto hover:bg-background"
                : "pointer-events-none"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            className={cn(
              `absolute right-2 top-1/2 -translate-y-1/2 ${Z_INDEX.content}`,
              `size-8 ${RADIUS.full} bg-background/80 backdrop-blur-md border border-border/50`,
              "items-center justify-center",
              `${SHADOW.md}`,
              "transition-all active:scale-90",
              "hidden lg:flex lg:opacity-0 lg:group-hover:opacity-100",
              canScrollRight
                ? "pointer-events-auto hover:bg-background"
                : "pointer-events-none"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {/* Pagination */}
      {(showDots || showCounter) && totalSlides > 1 && (
        <div className="flex items-center justify-center gap-4 mt-2">
          {showDots && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={cn(
                    `${RADIUS.full} transition-colors`,
                    i === currentSlide
                      ? "w-5 h-2 bg-primary"
                      : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
          {showCounter && (
            <span className="text-xs text-muted-foreground font-mono tabular-nums">
              {currentSlide + 1} / {totalSlides}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
