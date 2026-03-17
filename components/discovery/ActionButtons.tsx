/**
 * Action Buttons Component
 * Pass, Save to Campaign, and Like button controls
 * Updated for agency client-proposal workflow
 */

"use client";

import { motion } from "framer-motion";
import { Heart, X, ClipboardList } from "lucide-react";

interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSaveToCampaign?: () => void;
  isLoading?: boolean;
}

export function ActionButtons({
  onPass,
  onLike,
  onSaveToCampaign,
  isLoading = false,
}: ActionButtonsProps) {
  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <div
      className="flex justify-center items-center gap-6 mt-8"
      role="group"
      aria-label="Card actions"
    >
      {/* Pass Button */}
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onPass}
        disabled={isLoading}
        data-testid="pass-button"
        className="
          flex items-center justify-center
          w-14 h-14 rounded-full
          border-2 border-red-500 bg-white
          text-red-500 hover:bg-red-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          shadow-lg
        "
        aria-label="Pass - Press Left Arrow key"
        aria-busy={isLoading}
      >
        <X size={28} strokeWidth={2.5} />
      </motion.button>

      {/* Save to Campaign Button */}
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onSaveToCampaign}
        disabled={isLoading || !onSaveToCampaign}
        data-testid="save-button"
        className="
          flex items-center justify-center
          w-16 h-16 rounded-full
          border-2 border-purple-500 bg-white
          text-purple-500 hover:bg-purple-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          shadow-lg
        "
        aria-label="Save to Campaign"
        aria-disabled={!onSaveToCampaign}
        aria-busy={isLoading}
      >
        <ClipboardList size={32} strokeWidth={2} />
      </motion.button>

      {/* Like Button */}
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onLike}
        disabled={isLoading}
        data-testid="like-button"
        className="
          flex items-center justify-center
          w-14 h-14 rounded-full
          border-2 border-green-500 bg-white
          text-green-500 hover:bg-green-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          shadow-lg
        "
        aria-label="Like - Press Right Arrow key"
        aria-busy={isLoading}
      >
        <Heart size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
