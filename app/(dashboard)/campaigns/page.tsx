"use client";

import { useState } from "react";
import { Plus, Filter, Search, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";

const campaigns = [
  {
    id: "1",
    name: "Sarah Beauty x Skincare Brand Q4",
    brand: "L'Oreal",
    status: "in_progress",
    budget: { total: 250000, spent: 185000 },
    gmv: 185000,
    roi: -26,
    timeline: {
      start: "2024-11-01",
      end: "2024-12-31",
    },
    assignedKOLs: [
      { id: "1", name: "Mintra", avatar: null, status: "completed" },
      { id: "2", name: "Winwin Center", avatar: null, status: "in_progress" },
      { id: "3", name: "Pimprapa", avatar: null, status: "assigned" },
    ],
    nextMilestone: "Nov 20 Content Review",
  },
  {
    id: "2",
    name: "Sunscreen x GoXip",
    brand: "Goxip",
    status: "planning",
    budget: { total: 500000, spent: 0 },
    gmv: 0,
    roi: 0,
    timeline: {
      start: "2024-12-01",
      end: "2025-01-31",
    },
    assignedKOLs: [],
    nextMilestone: "KOL Selection by Mar 15",
  },
  {
    id: "3",
    name: "Tech Gadget Launch",
    brand: "Xiaomi",
    status: "contracting",
    budget: { total: 750000, spent: 50000 },
    gmv: 0,
    roi: 0,
    timeline: {
      start: "2024-12-15",
      end: "2025-02-28",
    },
    assignedKOLs: [
      { id: "4", name: "TechReviewer Pro", avatar: null, status: "contracted" },
    ],
    nextMilestone: "Contract signing",
  },
];

const statusColors: Record<string, string> = {
  planning: "bg-slate-500",
  kol_selection: "bg-blue-500",
  contracting: "bg-yellow-500",
  in_progress: "bg-green-500",
  review: "bg-purple-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  planning: "Planning",
  kol_selection: "KOL Selection",
  contracting: "Contracting",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your campaigns
          </p>
        </div>
        <Button asChild>
          <a href="/campaigns/new">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </a>
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button variant="outline" className="h-12">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="card-hover">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {campaign.brand}
                  </p>
                </div>
                <Badge
                  className={`${statusColors[campaign.status]} text-white`}
                >
                  {statusLabels[campaign.status]}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-mono font-semibold">
                    {formatCurrency(campaign.budget.spent)} /{" "}
                    {formatCurrency(campaign.budget.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GMV</p>
                  <p className="font-mono font-semibold">
                    {formatCurrency(campaign.gmv)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p
                    className={`font-mono font-semibold ${
                      campaign.roi >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {campaign.roi > 0 ? "+" : ""}
                    {campaign.roi}%
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Budget Usage</span>
                  <span className="font-medium">
                    {Math.round(
                      (campaign.budget.spent / campaign.budget.total) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (campaign.budget.spent / campaign.budget.total) * 100
                  }
                />
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(campaign.timeline.start)} -{" "}
                  {formatDate(campaign.timeline.end)}
                </span>
              </div>

              {/* KOLs */}
              {campaign.assignedKOLs.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {campaign.assignedKOLs.slice(0, 3).map((kol) => (
                      <Avatar
                        key={kol.id}
                        className="w-8 h-8 border-2 border-background"
                      >
                        <AvatarFallback className="text-xs">
                          {kol.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {campaign.assignedKOLs.length > 3 && (
                    <span className="text-sm text-muted-foreground">
                      +{campaign.assignedKOLs.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Next Milestone */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Next: {campaign.nextMilestone}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/campaigns/${campaign.id}`}>
                    Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
