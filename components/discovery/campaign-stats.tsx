/**
 * Campaign Stats Component
 * Sidebar component showing active campaign statistics
 */

"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Eye, BarChart3, Download, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CampaignStatsProps } from "@/lib/types/campaign";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `฿${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `฿${(num / 1000).toFixed(1)}K`;
  return `฿${num.toLocaleString()}`;
}

export function CampaignStats({ campaign, metrics }: CampaignStatsProps) {
  if (!campaign || !metrics) {
    return (
      <div
        data-testid="campaign-stats-sidebar"
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BarChart3 size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Campaign Stats</h3>
            <p className="text-xs text-gray-500">No active campaign</p>
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-2">Select or create a campaign to see stats</p>
          <p className="text-xs text-gray-400">
            KOLs you like will be added to your active campaign
          </p>
        </div>
      </div>
    );
  }

  const hasKOLs = metrics.totalKOLs > 0;

  return (
    <div
      data-testid="campaign-stats-sidebar"
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <BarChart3 size={20} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
          <p className="text-xs text-gray-500">
            {metrics.totalKOLs} KOL{metrics.totalKOLs !== 1 ? "s" : ""} selected
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {hasKOLs ? (
        <div className="space-y-3">
          {/* KOL Count */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between py-2 border-b border-purple-200"
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-600" />
              <span className="text-sm text-gray-600">KOLs Selected</span>
            </div>
            <span data-testid="campaign-kol-count" className="font-bold text-gray-900">
              {metrics.totalKOLs}
            </span>
          </motion.div>

          {/* Estimated Reach */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center justify-between py-2 border-b border-purple-200"
          >
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-purple-600" />
              <span className="text-sm text-gray-600">Est. Reach</span>
            </div>
            <span data-testid="campaign-estimated-reach" className="font-bold text-purple-700">
              {formatNumber(metrics.estimatedReach)}
            </span>
          </motion.div>

          {/* Avg Engagement Rate */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between py-2 border-b border-purple-200"
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-600" />
              <span className="text-sm text-gray-600">Avg Engagement</span>
            </div>
            <span className="font-bold text-green-600">
              {metrics.averageEngagementRate.toFixed(1)}%
            </span>
          </motion.div>

          {/* Total Fee */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" />
              <span className="text-sm text-gray-600">Total Fees</span>
            </div>
            <span className="font-bold text-orange-600">{formatCurrency(metrics.totalFee)}</span>
          </motion.div>

          {/* Tier Breakdown */}
          {Object.keys(metrics.tierBreakdown).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 pt-4 border-t border-purple-200"
            >
              <p className="text-xs font-medium text-gray-500 mb-2">Tier Breakdown</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(metrics.tierBreakdown).map(([tier, count]) => (
                  <span
                    key={tier}
                    className="inline-flex items-center px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-700 shadow-sm"
                  >
                    {tier}: {count}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No KOLs added yet</p>
          <p className="text-xs text-gray-400 mt-1">Swipe right to add KOLs to this campaign</p>
        </div>
      )}

      {/* Actions */}
      {hasKOLs && (
        <div className="mt-6 space-y-2">
          <Link
            href={`/campaigns/${campaign.id}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            View Campaign Details
            <ArrowRight size={16} />
          </Link>

          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            onClick={() => {
              // TODO: Implement export functionality
              console.log("Export campaign:", campaign.id);
            }}
          >
            <Download size={16} />
            Export Proposal
          </button>
        </div>
      )}
    </div>
  );
}
