/**
 * Tinder-Style Card Stack Component
 * Main discovery interface with swipe gestures and action buttons
 * Updated for agency client-proposal workflow
 */

"use client";

import { useState, useCallback } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { KOLCardData } from "@/lib/types/kol";
import { transformCardToDisplayData, KOLDisplayData } from "@/hooks/use-kol-display";
import { KOLCard } from "./kol-card";
import { KOLCardDetail } from "./kol-card-detail";
import { ActionButtons } from "./action-buttons";
import { useDiscoveryStore } from "@/lib/store/discovery-store";

interface CardStackProps {
  initialKols: KOLCardData[];
  onLoadMore?: () => Promise<KOLCardData[]>;
  onKOLLiked?: (kol: KOLCardData) => void;
}

export function CardStack({
  initialKols,
  onLoadMore,
  onKOLLiked,
}: CardStackProps) {
  const [cards, setCards] = useState(initialKols);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [detailKol, setDetailKol] = useState<KOLDisplayData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { addToLiked, addToPassed, addToSuperLiked } = useDiscoveryStore();

  // Motion values for swipe animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform values for swipe feedback
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Swipe feedback opacity
  const likeOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const passOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);

  const currentCard = cards[currentIndex];
  const currentDisplayData = currentCard ? transformCardToDisplayData(currentCard) : null;
  const nextCards = cards.slice(Math.max(0, currentIndex - 1), currentIndex + 3);

  const handleSwipeEnd = useCallback(
    (info: PanInfo) => {
      const swipeThreshold = 100;
      const velocity = Math.abs(info.velocity.x);

      // Determine swipe direction and action
      let action: "like" | "pass" | "superlike" | null = null;

      if (info.offset.x > swipeThreshold || velocity > 500) {
        action = "like";
      } else if (info.offset.x < -swipeThreshold || velocity < -500) {
        action = "pass";
      } else if (info.offset.y < -swipeThreshold) {
        action = "superlike";
      }

      if (action && currentCard) {
        // Record action
        if (action === "like") {
          addToLiked(currentCard);
          onKOLLiked?.(currentCard);
        } else if (action === "pass") {
          addToPassed(currentCard);
        } else if (action === "superlike") {
          addToSuperLiked(currentCard);
          onKOLLiked?.(currentCard);
        }

        // Move to next card
        moveToNextCard();
      }
    },
    [currentCard, addToLiked, addToPassed, addToSuperLiked, onKOLLiked]
  );

  const moveToNextCard = useCallback(async () => {
    const newIndex = currentIndex + 1;

    // Check if we need to load more cards
    if (newIndex >= cards.length - 3 && onLoadMore && !isLoading) {
      setIsLoading(true);
      try {
        const moreCards = await onLoadMore();
        setCards((prev) => [...prev, ...moreCards]);
      } finally {
        setIsLoading(false);
      }
    }

    setCurrentIndex(newIndex);
  }, [currentIndex, cards.length, onLoadMore, isLoading]);

  const handleLike = useCallback(() => {
    if (currentCard) {
      addToLiked(currentCard);
      onKOLLiked?.(currentCard);
      moveToNextCard();
    }
  }, [currentCard, addToLiked, moveToNextCard, onKOLLiked]);

  const handlePass = useCallback(() => {
    if (currentCard) {
      addToPassed(currentCard);
      moveToNextCard();
    }
  }, [currentCard, addToPassed, moveToNextCard]);


  const handleOpenDetail = useCallback(() => {
    if (currentDisplayData) {
      setDetailKol(currentDisplayData);
      setIsDetailOpen(true);
    }
  }, [currentDisplayData]);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpenDetail();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePass();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleLike();
      }
    },
    [handleOpenDetail, handlePass, handleLike]
  );

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setDetailKol(null);
  }, []);

  // No more cards
  if (currentIndex >= cards.length) {
    return (
      <div
        data-testid="end-of-stack"
        className="flex flex-col items-center justify-center h-[600px] text-center px-4"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;ve seen everyone!</h2>
        <p className="text-gray-600 mb-6">No more KOLs to discover right now</p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setCards(initialKols);
          }}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          aria-label="Start over from the beginning"
        >
          Start Over
        </button>
      </div>
    );
  }

  if (!currentCard || !currentDisplayData) {
    return (
      <div data-testid="loading-spinner" className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="h-12 w-12 border-4 border-purple-300 border-t-purple-600 rounded-full" />
          </div>
          <p className="mt-4 text-gray-600">Loading KOLs...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="card-stack"
      className="w-full max-w-sm mx-auto"
      role="region"
      aria-label="KOL Discovery Cards"
    >
      {/* Card Stack */}
      <div className="relative h-[520px] perspective">
        {/* Background cards (for depth) */}
        {nextCards.map((kol, idx) => {
          if (kol.id === currentCard.id) return null;

          const displayData = transformCardToDisplayData(kol);

          return (
            <motion.div
              key={kol.id}
              className="absolute inset-0 pointer-events-none"
              initial={{
                scale: 1 - (idx + 1) * 0.05,
                y: (idx + 1) * 10,
                zIndex: 10 - idx,
              }}
              animate={{
                scale: 1 - (idx + 1) * 0.05,
                y: (idx + 1) * 10,
                zIndex: 10 - idx,
              }}
            >
              <div className="w-full h-full opacity-60">
                <KOLCard kol={displayData} isInteractive={false} />
              </div>
            </motion.div>
          );
        })}

        {/* Active card (draggable) */}
        <motion.div
          key={currentCard.id}
          drag="x"
          dragConstraints={{ left: -500, right: 500 }}
          dragElastic={0.2}
          onDragEnd={(_event, info) => handleSwipeEnd(info)}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0, rotate: 20 }}
          data-testid="active-card"
          role="button"
          tabIndex={0}
          aria-label={`${currentDisplayData.nickname}, ${currentDisplayData.followers.toLocaleString()} followers, ${currentDisplayData.engagementRate}% engagement. Press Enter to view details, Left arrow to pass, Right arrow to like.`}
          onKeyDown={handleCardKeyDown}
          style={{
            x,
            y,
            rotate,
            opacity,
            touchAction: "none",
            zIndex: 20,
          }}
          className="absolute inset-0 cursor-pointer"
        >
          {/* Swipe Feedback Overlays */}
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-green-500/20 rounded-2xl pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            <div className="border-4 border-green-500 text-green-500 font-bold text-5xl px-8 py-4 rounded-xl transform -rotate-12">
              LIKE
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-red-500/20 rounded-2xl pointer-events-none"
            style={{ opacity: passOpacity }}
          >
            <div className="border-4 border-red-500 text-red-500 font-bold text-5xl px-8 py-4 rounded-xl transform rotate-12">
              PASS
            </div>
          </motion.div>

          <KOLCard kol={currentDisplayData} isInteractive={true} onTap={handleOpenDetail} />
        </motion.div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onPass={handlePass}
        onLike={handleLike}
        isLoading={isLoading}
      />

      {/* Progress Indicator */}
      <div className="mt-6 text-center" aria-live="polite" aria-atomic="true">
        <div className="text-sm text-gray-600">
          {currentIndex + 1} of {cards.length} KOLs
        </div>
        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            animate={{
              width: `${((currentIndex + 1) / cards.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <KOLCardDetail
        kol={detailKol || currentDisplayData}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
