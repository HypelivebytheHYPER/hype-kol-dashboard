/**
 * KOL Card Detail Component
 * Full detail view showing all KOL information
 * Used in modal or expanded card view
 */

"use client";

import { KOLDisplayData } from "@/lib/types/kol";
import { formatFollowers } from "@/lib/hooks/useKOLDisplay";
import Image from "next/image";
import {
  User,
  BadgeCheck,
  TrendingUp,
  DollarSign,
  Star,
  X,
  Video,
  Radio,
  Package,
  ExternalLink,
  Phone,
  Mail,
  MessageCircle,
  Lock,
} from "lucide-react";
import { useState } from "react";

interface KOLCardDetailProps {
  kol: KOLDisplayData;
  isOpen: boolean;
  onClose: () => void;
  isInCampaign?: boolean;
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
    S: "S-Tier",
    A: "A-Tier",
    B: "B-Tier",
    C: "C-Tier",
  };
  return labels[tier as keyof typeof labels] || "C-Tier";
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

function getQualityLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Average";
  return "Developing";
}

export function KOLCardDetail({ kol, isOpen, onClose, isInCampaign = false }: KOLCardDetailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "contact">("overview");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kol-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Image Section */}
          <div className="relative h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
            {kol.profileImage ? (
              <Image
                src={kol.profileImage}
                alt={kol.nickname}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                <div className="text-center text-gray-600">
                  <User className="w-20 h-20 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No image</p>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Top Row: Tier and Platform */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {/* Tier Badge */}
              <div
                className={`${getTierColor(kol.tier)} px-3 py-1 rounded-full text-white font-bold text-sm shadow-md`}
              >
                {getTierLabel(kol.tier)}
              </div>

              {/* Platform & Verified */}
              <div className="flex items-center gap-2">
                {kol.verified && (
                  <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`${getPlatformColor(kol.platform)} px-3 py-1 rounded-full text-white text-sm font-semibold shadow-md`}
                >
                  {kol.platform}
                </div>
              </div>
            </div>

            {/* Name Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 id="kol-detail-title" className="text-2xl font-bold text-white mb-1">
                {kol.nickname}
              </h2>
              <p className="text-white/80">@{kol.handle}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="flex border-b border-gray-200"
            role="tablist"
            aria-label="KOL Information Tabs"
          >
            <button
              onClick={() => setActiveTab("overview")}
              role="tab"
              aria-selected={activeTab === "overview"}
              aria-controls="overview-panel"
              id="overview-tab"
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              role="tab"
              aria-selected={activeTab === "contact"}
              aria-controls="contact-panel"
              id="contact-tab"
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                activeTab === "contact"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Contact
              {!isInCampaign && <Lock className="w-3 h-3" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {activeTab === "overview" ? (
              <div
                id="overview-panel"
                role="tabpanel"
                aria-labelledby="overview-tab"
                className="space-y-5"
              >
                {/* Bio */}
                {kol.bio && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700 text-sm leading-relaxed">{kol.bio}</p>
                  </div>
                )}

                {/* Category & Content Type */}
                <div className="flex flex-wrap gap-2">
                  {kol.category && (
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {kol.category}
                    </span>
                  )}
                  <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    {kol.contentType}
                  </span>
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Followers */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="flex items-center gap-1.5 text-gray-600 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Followers</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                      {formatFollowers(kol.followers)}
                    </p>
                  </div>

                  {/* Engagement Rate */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="flex items-center gap-1.5 text-gray-600 mb-2">
                      <Star className="w-4 h-4" />
                      <span className="text-sm">Engagement</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {kol.engagementRate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* GMV */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium">Average Monthly GMV</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-700">{kol.avgMonthlyGMV}</p>
                </div>

                {/* Activity Stats */}
                {(kol.liveCount !== undefined ||
                  kol.videoCount !== undefined ||
                  kol.productCount !== undefined) && (
                  <div className="grid grid-cols-3 gap-3">
                    {kol.liveCount !== undefined && (
                      <div className="bg-red-50 p-3 rounded-xl text-center">
                        <Radio className="w-5 h-5 text-red-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-red-700">{kol.liveCount}</p>
                        <p className="text-xs text-gray-600">Lives</p>
                      </div>
                    )}
                    {kol.videoCount !== undefined && (
                      <div className="bg-blue-50 p-3 rounded-xl text-center">
                        <Video className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-700">{kol.videoCount}</p>
                        <p className="text-xs text-gray-600">Videos</p>
                      </div>
                    )}
                    {kol.productCount !== undefined && (
                      <div className="bg-indigo-50 p-3 rounded-xl text-center">
                        <Package className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-indigo-700">{kol.productCount}</p>
                        <p className="text-xs text-gray-600">Products</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quality Score */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-700">Quality Score</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{kol.qualityScore}</span>
                      <span className="text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-green-500 transition-all"
                      style={{ width: `${Math.min(kol.qualityScore, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {getQualityLabel(kol.qualityScore)}
                  </p>
                </div>

                {/* Social Links */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Social Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {kol.tiktokUrl ? (
                      <a
                        href={kol.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        TikTok
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm">
                        TikTok unavailable
                      </span>
                    )}
                    {kol.instagramUrl ? (
                      <a
                        href={kol.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Instagram
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm">
                        Instagram unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Contact Tab */
              <div
                id="contact-panel"
                role="tabpanel"
                aria-labelledby="contact-tab"
                className="space-y-4"
              >
                {!isInCampaign ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-700 mb-1">Contact Info Locked</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add this KOL to a campaign to unlock contact information
                    </p>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      Add to Campaign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {kol.phone && (
                      <a
                        href={`tel:${kol.phone}`}
                        className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{kol.phone}</p>
                        </div>
                      </a>
                    )}
                    {kol.lineId && (
                      <a
                        href={`https://line.me/ti/p/~${kol.lineId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">LINE ID</p>
                          <p className="font-medium text-gray-900">{kol.lineId}</p>
                        </div>
                      </a>
                    )}
                    {kol.email && (
                      <a
                        href={`mailto:${kol.email}`}
                        className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{kol.email}</p>
                        </div>
                      </a>
                    )}
                    {!kol.phone && !kol.lineId && !kol.email && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No contact information available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
