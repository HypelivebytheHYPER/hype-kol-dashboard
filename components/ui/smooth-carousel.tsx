"use client";

import { useRef, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface SmoothCarouselProps {
  children: ReactNode;
  itemWidth?: number;
  gap?: number;
  className?: string;
}

// Detect touch device for optimized handling
const isTouchDevice =
  typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export function SmoothCarousel({
  children,
  itemWidth = 280,
  gap = 16,
  className = "",
}: SmoothCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const x = useMotionValue(0);
  // Lighter spring for performance - reduced stiffness to prevent jank
  const springX = useSpring(x, {
    stiffness: isMobile ? 100 : 200,
    damping: isMobile ? 15 : 25,
    mass: 0.5,
  });

  // Memoize transform to prevent recreation on every render
  const scaleX = useTransform(springX, [0, -maxScroll || 1], [0.1, 1]);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update scroll constraints
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateConstraints = () => {
      const max = container.scrollWidth - container.clientWidth;
      setMaxScroll(max);
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < max - 1);
    };

    updateConstraints();
    container.addEventListener("scroll", updateConstraints, { passive: true });
    window.addEventListener("resize", updateConstraints);

    return () => {
      container.removeEventListener("scroll", updateConstraints);
      window.removeEventListener("resize", updateConstraints);
    };
  }, []);

  // Mouse/Touch drag handling - disabled on mobile for native scroll
  const handleDragStart = useCallback(() => {
    if (isMobile) return;
    setIsDragging(true);
    const container = containerRef.current;
    if (container) {
      setScrollLeft(container.scrollLeft);
    }
  }, [isMobile]);

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: { delta: { x: number } }) => {
      if (isMobile) return;
      const container = containerRef.current;
      if (!container) return;

      const delta = info.delta.x;
      container.scrollLeft = scrollLeft - delta;
    },
    [scrollLeft, isMobile]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Smooth scroll to direction
  const scrollTo = useCallback(
    (direction: "left" | "right") => {
      const container = containerRef.current;
      if (!container) return;

      const scrollAmount = itemWidth + gap;
      const target =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: target,
        behavior: "smooth",
      });
    },
    [itemWidth, gap]
  );

  // Wheel handling for smooth horizontal scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Check if horizontal scroll
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }

    // Prevent vertical scroll when scrolling horizontally
    if (Math.abs(e.deltaY) > 0 && container.scrollWidth > container.clientWidth) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  }, []);

  return (
    <div className={`relative group ${className}`}>
      {/* Left Arrow - hidden on mobile */}
      <Button
        variant="secondary"
        size="icon"
        className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
          !canScrollLeft ? "pointer-events-none opacity-0" : ""
        }`}
        onClick={() => scrollTo("left")}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* Right Arrow - hidden on mobile */}
      <Button
        variant="secondary"
        size="icon"
        className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
          !canScrollRight ? "pointer-events-none opacity-0" : ""
        }`}
        onClick={() => scrollTo("right")}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Carousel Container - use native scroll on mobile */}
      <motion.div
        ref={containerRef}
        className={`flex overflow-x-auto scrollbar-hide ${
          isMobile ? "snap-x snap-mandatory scroll-smooth" : "cursor-grab"
        } ${isDragging ? "cursor-grabbing" : ""}`}
        style={{ gap }}
        drag={isMobile ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={isMobile ? 0 : 0.1}
        dragTransition={{
          bounceStiffness: isMobile ? 100 : 300,
          bounceDamping: isMobile ? 15 : 30,
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        whileTap={isMobile ? undefined : { cursor: "grabbing" }}
      >
        {children}
      </motion.div>

      {/* Scroll Progress Indicator - hidden on mobile */}
      <div className="hidden md:block mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full origin-left"
          style={{
            scaleX,
          }}
        />
      </div>

      {/* Mobile scroll hint dots */}
      {isMobile && maxScroll > 0 && (
        <div className="flex md:hidden justify-center gap-1.5 mt-3">
          {Array.from({ length: Math.min(5, Math.ceil(maxScroll / itemWidth) + 1) }).map((_, i) => {
            const segmentSize = maxScroll / Math.ceil(maxScroll / itemWidth);
            const isActive =
              scrollLeft >= segmentSize * i - itemWidth / 2 &&
              scrollLeft < segmentSize * (i + 1) - itemWidth / 2;
            return (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Card wrapper for consistent sizing
interface CarouselItemProps {
  children: ReactNode;
  className?: string;
  width?: number;
}

export function CarouselItem({ children, className = "", width = 280 }: CarouselItemProps) {
  return (
    <motion.div
      className={`flex-shrink-0 snap-start ${className}`}
      style={{ width }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
