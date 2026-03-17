/**
 * Campaign Selector Component
 * Dropdown/selector for the discovery page header
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Folder, Check } from "lucide-react";
import { useCampaignStore } from "@/lib/store/campaign-store";
import type { CampaignSelectorProps } from "@/lib/types/campaign";

export function CampaignSelector({
  selectedCampaignId,
  onSelectCampaign,
  showCreateNew = true,
}: CampaignSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const campaigns = useCampaignStore((state) => state.campaigns);
  const createCampaign = useCampaignStore((state) => state.createCampaign);

  // Get selected campaign name
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateCampaign = () => {
    if (newCampaignName.trim()) {
      const newCampaign = createCampaign({ name: newCampaignName.trim() });
      onSelectCampaign(newCampaign.id);
      setNewCampaignName("");
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateCampaign();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewCampaignName("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="campaign-selector"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="campaign-listbox"
        aria-label={selectedCampaign?.name || "Select Campaign"}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${
            selectedCampaignId
              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
      >
        <Folder size={18} />
        <span className="max-w-[150px] truncate">
          {selectedCampaign?.name || "Select Campaign"}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            data-testid="campaign-dropdown"
            role="listbox"
            id="campaign-listbox"
            aria-label="Available campaigns"
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Active Campaign</p>
              <p className="text-xs text-gray-500 mt-0.5">KOLs you like will be added here</p>
            </div>

            {/* Campaign List */}
            <div className="max-h-64 overflow-y-auto">
              {campaigns.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-500">No campaigns yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first campaign</p>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => {
                      onSelectCampaign(campaign.id);
                      setIsOpen(false);
                    }}
                    role="option"
                    aria-selected={selectedCampaignId === campaign.id}
                    className={`
                      w-full flex items-center justify-between px-4 py-3
                      hover:bg-gray-50 transition-colors text-left
                      ${selectedCampaignId === campaign.id ? "bg-purple-50" : ""}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          selectedCampaignId === campaign.id ? "text-purple-700" : "text-gray-900"
                        }`}
                      >
                        {campaign.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {campaign.kols.length} KOL{campaign.kols.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {selectedCampaignId === campaign.id && (
                      <Check size={16} className="text-purple-600 ml-2" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create New Section */}
            {showCreateNew && (
              <div className="border-t border-gray-100">
                {isCreating ? (
                  <div className="p-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Campaign name..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCreateCampaign}
                        disabled={!newCampaignName.trim()}
                        data-testid="selector-create-btn"
                        className="flex-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setNewCampaignName("");
                        }}
                        data-testid="selector-cancel-btn"
                        className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreating(true)}
                    data-testid="create-new-campaign-option"
                    className="w-full flex items-center gap-2 px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Plus size={18} />
                    <span className="font-medium">Create New Campaign</span>
                  </button>
                )}
              </div>
            )}

            {/* Clear Selection */}
            {selectedCampaignId && (
              <button
                onClick={() => {
                  onSelectCampaign(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                Clear selection
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
