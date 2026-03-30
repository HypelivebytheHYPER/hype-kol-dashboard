/**
 * Quick Add Toast Component
 * Toast notification when KOL added to campaign
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ExternalLink, RotateCcw } from "lucide-react";
import type { QuickAddToastProps } from "@/lib/types/campaign";

interface ToastItem extends QuickAddToastProps {
  id: string;
}

interface QuickAddToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

interface ToastItemComponentProps {
  id: string;
  kolNickname: string;
  campaignName: string;
  onUndo: () => void;
  onViewCampaign: () => void;
  onDismiss: (id: string) => void;
}

function ToastItemComponent({
  id,
  kolNickname,
  campaignName,
  onUndo,
  onViewCampaign,
  onDismiss,
}: ToastItemComponentProps) {
  const [progress, setProgress] = useState(100);
  const AUTO_DISMISS_DURATION = 3000; // 3 seconds

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_DURATION) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      data-testid="quick-add-toast"
      className="relative bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-[320px] max-w-[400px]"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={20} className="text-green-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">Added to Campaign</p>
            <p className="text-sm text-gray-600 mt-0.5">
              <span className="font-medium text-gray-900">{kolNickname}</span> added to{""}
              <span className="font-medium text-purple-700">{campaignName}</span>
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => onDismiss(id)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              onUndo();
              onDismiss(id);
            }}
            data-testid="toast-undo-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={14} />
            Undo
          </button>

          <button
            onClick={() => {
              onViewCampaign();
              onDismiss(id);
            }}
            data-testid="toast-view-campaign-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <ExternalLink size={14} />
            View Campaign
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function QuickAddToastContainer({ toasts, onDismiss }: QuickAddToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItemComponent key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useQuickAddToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (props: Omit<ToastItem, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...props, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
  };
}
