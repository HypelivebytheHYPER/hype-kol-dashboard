"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

const mockCampaign = {
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
    { id: "1", name: "Mintra", status: "completed", deliverables: 3 },
    { id: "2", name: "Winwin Center", status: "in_progress", deliverables: 2 },
    { id: "3", name: "Pimprapa", status: "assigned", deliverables: 0 },
  ],
  milestones: [
    { id: "1", name: "Campaign Kickoff", date: "2024-11-01", status: "completed" },
    { id: "2", name: "Content Creation", date: "2024-11-15", status: "completed" },
    { id: "3", name: "Review & Approval", date: "2024-11-20", status: "in_progress" },
    { id: "4", name: "Campaign Launch", date: "2024-12-01", status: "pending" },
  ],
};

const statusColors: Record<string, string> = {
  completed: "bg-green-500",
  in_progress: "bg-blue-500",
  pending: "bg-muted",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaign = mockCampaign;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-title font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.brand}</p>
        </div>
        <Badge className={`${statusColors[campaign.status]} text-white`}>
          {campaign.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="text-2xl font-bold font-mono mt-1">
              {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
            </p>
            <Progress
              value={(campaign.budget.spent / campaign.budget.total) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">GMV</p>
            <p className="text-2xl font-bold font-mono mt-1">
              {formatCurrency(campaign.gmv)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">ROI</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${campaign.roi >= 0 ? "text-green-500" : "text-red-500"}`}>
              {campaign.roi > 0 ? "+" : ""}{campaign.roi}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Timeline</p>
            <p className="text-sm mt-1">
              {formatDate(campaign.timeline.start)} - {formatDate(campaign.timeline.end)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kols">KOLs</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${statusColors[milestone.status]}`} />
                    <div className="flex-1">
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(milestone.date)}</p>
                    </div>
                    <Badge variant={milestone.status === "completed" ? "default" : "secondary"}>
                      {milestone.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Add KOL to Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Update Milestone
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-500">
                  Cancel Campaign
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kols" className="mt-6">
          <div className="space-y-4">
            {campaign.assignedKOLs.map((kol) => (
              <Card key={kol.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{kol.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{kol.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {kol.deliverables} deliverables
                      </p>
                    </div>
                  </div>
                  <Badge variant={kol.status === "completed" ? "default" : "secondary"}>
                    {kol.status.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Gantt chart will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Campaign analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
