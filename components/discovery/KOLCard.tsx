/**
 * KOL Discovery Card Component - Agency Client Proposal Focus
 * Displays a single KOL profile with metrics clients care about
 */

"use client";

import { KOLDisplayData } from "@/lib/types/kol";
import { formatFollowers } from "@/lib/hooks/useKOLDisplay";
import Image from "next/image";
import { User, BadgeCheck, TrendingUp, DollarSign, Star, ChevronRight } from "lucide-react";

interface KOLCardProps {
  kol: KOLDisplayData;
  isInteractive?: boolean;
  onTap?: () => void;
  swipeDirection?: "left" | "right" | null;
}

function getTierColor(tier: string): string {
  const colors = {
    S: "bg-yellow-400",
    A: "bg-purple-500",
    B: "bg-blue-400",
    C: "bg-gray-400",
  };
  return colors[tier as keyof typeof colors] || "bg-gray-400";
}

function getTierLabel(tier: string): string {
  const labels = {
    S: "S",
    A: "A",
    B: "B",
    C: "C",
  };
  return labels[tier as keyof typeof labels] || "C";
}

function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    TikTok: "bg-black",
    Instagram: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
    YouTube: "bg-red-600",
    Facebook: "bg-blue-600",
    Shopee: "bg-orange-500",
  };
  return colors[platform] || "bg-gray-600";
}

export function KOLCard({ kol, isInteractive = true, onTap, swipeDirection }: KOLCardProps) {
  return (
    <div
      onClick={onTap}
      data-testid="kol-card"
      className={`
        relative h-full flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden
        transition-all duration-300
        ${isInteractive ? "cursor-grab active:cursor-grabbing" : ""}
        ${onTap ? "cursor-pointer" : ""}
      `}
    >
      {/* Swipe Feedback Overlays */}
      {swipeDirection === "right" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-green-500/20 pointer-events-none">
          <div className="border-4 border-green-500 text-green-500 font-bold text-4xl px-6 py-3 rounded-lg transform -rotate-12">
            LIKE
          </div>
        </div>
      )}
      {swipeDirection === "left" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-500/20 pointer-events-none">
          <div className="border-4 border-red-500 text-red-500 font-bold text-4xl px-6 py-3 rounded-lg transform rotate-12">
            PASS
          </div>
        </div>
      )}

      {/* Profile Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
        {kol.profileImage ? (
          <Image
            src={kol.profileImage}
            alt={kol.nickname}
            fill
            sizes="(max-width: 640px) 90vw, 400px"
            quality={80}
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
            <div className="text-center text-gray-600">
              <User className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Row: Tier and Platform */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Tier Badge */}
          <div
            className={`${getTierColor(kol.tier)} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}
          >
            {getTierLabel(kol.tier)}
          </div>

          {/* Platform & Verified */}
          <div className="flex items-center gap-2">
            {kol.verified && (
              <div className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`${getPlatformColor(kol.platform)} px-2 py-1 rounded-full text-white text-xs font-semibold shadow-md`}
            >
              {kol.platform}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Name & Handle */}
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{kol.nickname}</h2>
          <p className="text-sm text-gray-500">@{kol.handle}</p>
        </div>

        {/* Category & Content Type Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {kol.category && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {kol.category}
            </span>
          )}
          <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
            {kol.contentType}
          </span>
        </div>

        {/* Primary Metrics - Client Focus */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Followers */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Followers</span>
            </div>
            <p className="text-lg font-bold text-purple-700">{formatFollowers(kol.followers)}</p>
          </div>

          {/* Engagement Rate */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <Star className="w-3 h-3" />
              <span className="text-xs">Engage%</span>
            </div>
            <p className="text-lg font-bold text-green-700">{kol.engagementRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* GMV & Quality Row */}
        <div className="space-y-3">
          {/* Average Monthly GMV */}
          <div className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Avg GMV/mo</span>
            </div>
            <span className="font-bold text-orange-700">{kol.avgMonthlyGMV}</span>
          </div>

          {/* Quality Score */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Quality Score</span>
              <span className="font-bold text-gray-900">{kol.qualityScore}/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-green-500 transition-all"
                style={{ width: `${Math.min(kol.qualityScore, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tap for Details Hint */}
        {onTap && (
          <div
            data-testid="kol-card-tap-area"
            className="mt-auto pt-3 flex items-center justify-center text-gray-400 text-xs"
          >
            <span>Tap for details</span>
            <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}
