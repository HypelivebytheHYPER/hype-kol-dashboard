"use client";


import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 1) + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * (itemsPerPage || 1), totalItems) : null;

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {totalItems && startItem && endItem && (
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {startItem}-{endItem}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> results
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="size-9 rounded-full"
        >
          <ChevronLeft />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers(currentPage, totalPages).map((page, i) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "relative size-9 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95",
                  currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="size-9 rounded-full"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Always show first page
  pages.push(1);

  if (current <= 3) {
    // Near start: show 2, 3, 4, ellipsis, last
    pages.push(2, 3, 4, "ellipsis", total);
  } else if (current >= total - 2) {
    // Near end: show ellipsis, total-3, total-2, total-1, last
    pages.push("ellipsis", total - 3, total - 2, total - 1, total);
  } else {
    // Middle: show ellipsis, current-1, current, current+1, ellipsis, last
    pages.push("ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }

  return pages;
}
