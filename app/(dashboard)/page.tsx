import { Suspense } from "react";
import {
  Briefcase,
  TrendingUp,
  Percent,
  Radio,
  ChevronRight,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

// Mock data - replace with actual API calls
const stats = [
  {
    title: "Campaigns Active",
    value: "2",
    icon: Briefcase,
    change: "+1 this week",
    trend: "up",
  },
  {
    title: "Projected GMV",
    value: formatCurrency(4200000),
    icon: TrendingUp,
    change: "+15% vs last month",
    trend: "up",
  },
  {
    title: "Margin Avg",
    value: "45%",
    icon: Percent,
    change: "+3% vs target",
    trend: "up",
  },
  {
    title: "Live Sellers",
    value: "12",
    icon: Radio,
    change: "8 streaming now",
    trend: "neutral",
  },
];

const recentSearches = [
  { label: "Beauty > Micro", href: "/discovery?category=beauty&tier=micro" },
  { label: "Live Seller > 1M GMV", href: "/discovery?type=live&gmvMin=1000000" },
  { label: "Gen Z > Bangkok", href: "/discovery?audience=gen-z&location=bangkok" },
];

const activeCampaigns = [
  {
    id: "1",
    name: "Sarah Beauty x Skincare Brand Q4",
    brand: "L'Oreal",
    budget: { total: 250000, spent: 185000 },
    gmv: 185000,
    roi: -26,
    kolsAssigned: 3,
    kolsTotal: 5,
    status: "in_progress",
    nextMilestone: "Nov 20 Content Review",
  },
  {
    id: "2",
    name: "Sunscreen x GoXip",
    brand: "Goxip",
    budget: { total: 500000, spent: 0 },
    gmv: 0,
    roi: 0,
    kolsAssigned: 0,
    kolsTotal: 8,
    status: "planning",
    nextMilestone: "KOL Selection by Mar 15",
  },
];

const trendingNow = [
  {
    name: "Mintra",
    handle: "@mintrako8764",
    isLive: true,
    gmv: 450000,
    viewers: 12000,
    duration: 45,
  },
  {
    name: "Winwin Center",
    handle: "@winwincenter",
    isLive: true,
    gmv: 380000,
    viewers: 8500,
    duration: 32,
  },
  {
    name: "Pimprapa",
    handle: "@pimprapa",
    isLive: false,
    startingIn: 15,
    gmv: null,
    viewers: null,
    duration: null,
  },
];

export default function CommandCenterPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display font-bold">Command Center</h1>
        <p className="text-muted-foreground mt-1">
          Executive overview and quick actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Discovery */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Discovery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search KOLs, campaigns, or brands..."
                className="w-full h-12 px-4 rounded-lg bg-muted border border-input focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Recent Searches</p>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <a
                    key={search.label}
                    href={search.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <span className="text-sm">{search.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Active Campaigns</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/campaigns">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 rounded-lg border border-border space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {campaign.kolsAssigned} KOL assigned
                      {campaign.kolsAssigned !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      campaign.status === "in_progress" ? "default" : "secondary"
                    }
                  >
                    {campaign.status === "in_progress"
                      ? "In Progress"
                      : "Planning"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(campaign.budget.spent)} /{" "}
                      {formatCurrency(campaign.budget.total)}
                    </span>
                    <span
                      className={
                        campaign.roi >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {campaign.roi > 0 ? "+" : ""}
                      {campaign.roi}% ROI
                    </span>
                  </div>
                  <Progress
                    value={(campaign.budget.spent / campaign.budget.total) * 100}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Next: {campaign.nextMilestone}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Trending Now */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title font-semibold">Trending Now</h2>
          <Button variant="ghost" size="sm" asChild>
            <a href="/live">
              View Live Center
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingNow.map((kol) => (
            <Card key={kol.handle} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`/avatars/${kol.handle}.jpg`} />
                    <AvatarFallback>{kol.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{kol.name}</h4>
                      {kol.isLive && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <span className="w-2 h-2 rounded-full bg-red-500 live-indicator" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{kol.handle}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  {kol.isLive ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold font-mono">
                          {formatCurrency(kol.gmv || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">GMV</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold font-mono">
                          {kol.viewers?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Viewers</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold font-mono">
                          {kol.duration}m
                        </p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Starting in {kol.startingIn} min
                      </span>
                    </div>
                  )}
                </div>

                <Button className="w-full mt-4" variant="outline" size="sm">
                  {kol.isLive ? "Watch Stream" : "Notify Me"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
