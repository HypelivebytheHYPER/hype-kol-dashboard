import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatNumber } from "@/lib/utils";

// This would be fetched from API in production
const mockKOL = {
  id: "1",
  name: "Mintra",
  handle: "@mintrako8764",
  platform: "tiktok",
  tier: "macro",
  followers: 506000,
  engagementRate: 10.8,
  avgGMV: 1900000,
  qualityScore: 3.5,
  categories: ["beauty", "lifestyle"],
  location: "Bangkok",
};

export default function KOLProfilePage({
  params,
}: {
  params: Promise<{ kolId: string }>;
}) {
  // In production, fetch KOL data based on params.kolId

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={`/avatars/${mockKOL.id}.jpg`} />
                <AvatarFallback className="text-2xl">{mockKOL.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-title font-bold">{mockKOL.name}</h1>
                  <Badge
                    className="bg-purple-500 text-white"
                  >
                    {mockKOL.tier}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{mockKOL.handle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{mockKOL.platform}</Badge>
                  <Badge variant="outline">{mockKOL.location}</Badge>
                  {mockKOL.categories.map((cat) => (
                    <Badge key={cat} variant="outline">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">View TikTok</Button>
              <Button>Add to Campaign</Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-2xl font-bold font-mono">
                {formatNumber(mockKOL.followers)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engagement</p>
              <p className="text-2xl font-bold font-mono">
                {mockKOL.engagementRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg GMV</p>
              <p className="text-2xl font-bold font-mono">
                {formatCurrency(mockKOL.avgGMV)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
              <p className="text-2xl font-bold font-mono">
                {mockKOL.qualityScore}/5
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign History</TabsTrigger>
          <TabsTrigger value="rates">Rate Card</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GMV Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-center text-muted-foreground">
                  GMV Chart Placeholder
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-center text-muted-foreground">
                  Demographics Chart Placeholder
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Campaign history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Rate card will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Contact information will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
