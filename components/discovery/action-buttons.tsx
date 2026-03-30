"use client";

import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";

interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  isLoading?: boolean;
}

export function ActionButtons({ onPass, onLike, isLoading = false }: ActionButtonsProps) {
  const variants = { hover: { scale: 1.1 }, tap: { scale: 0.95 } };

  return (
    <div className="flex justify-center items-center gap-6 mt-8" role="group" aria-label="Card actions">
      <motion.button
        variants={variants}
        whileHover="hover"
        whileTap="tap"
        onClick={onPass}
        disabled={isLoading}
        className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-red-500 bg-white text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
        aria-label="Pass"
      >
        <X size={28} strokeWidth={2.5} />
      </motion.button>

      <motion.button
        variants={variants}
        whileHover="hover"
        whileTap="tap"
        onClick={onLike}
        disabled={isLoading}
        className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-green-500 bg-white text-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
        aria-label="Like"
      >
        <Heart size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
