"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Percent, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

const tierComparison = [
  { tier: "Nano", us: 5000, ripples: 4500, pondanew: 5500, marketAvg: 5000 },
  { tier: "Micro", us: 25000, ripples: 22000, pondanew: 28000, marketAvg: 25000 },
  { tier: "Mid", us: 80000, ripples: 75000, pondanew: 85000, marketAvg: 80000 },
  { tier: "Macro", us: 250000, ripples: 280000, pondanew: 260000, marketAvg: 263000 },
  { tier: "Mega", us: 800000, ripples: 900000, pondanew: 750000, marketAvg: 817000 },
];

const contentTypes = [
  { id: "product_review", name: "Product Review (Video)", baseRate: 45000 },
  { id: "live_1hr", name: "Live Selling (1 hour)", baseRate: 90000 },
  { id: "story_series", name: "Story Series (3)", baseRate: 25000 },
  { id: "usage_rights", name: "Usage Rights (1 month)", baseRate: 15000 },
];

export default function PricingPage() {
  const [clientBudget, setClientBudget] = useState(250000);
  const [selectedTier, setSelectedTier] = useState("micro");
  const [quantity, setQuantity] = useState(3);
  const [markup, setMarkup] = useState(50);

  const selectedTierData = tierComparison.find((t) => t.tier.toLowerCase() === selectedTier);
  const unitRate = selectedTierData?.us || 25000;
  const ourCost = unitRate * quantity;
  const clientCost = ourCost * (1 + markup / 100);
  const margin = clientCost - ourCost;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display font-bold">Pricing Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Rate comparison and margin optimization
        </p>
      </div>

      {/* Competitor Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tier Rate Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tier</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-primary">Us</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ripples</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Pondanew</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Market Avg</th>
                </tr>
              </thead>
              <tbody>
                {tierComparison.map((row) => (
                  <tr key={row.tier} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{row.tier}</td>
                    <td className="text-right py-3 px-4 font-mono text-primary">
                      {formatCurrency(row.us)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-muted-foreground">
                      {formatCurrency(row.ripples)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-muted-foreground">
                      {formatCurrency(row.pondanew)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-muted-foreground">
                      {formatCurrency(row.marketAvg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-muted">
            <p className="text-sm">
              <span className="text-green-500 font-medium">Position:</span> Competitive on Nano/Micro tiers.
              <span className="text-yellow-500 font-medium"> Opportunity:</span> Consider increasing Macro rates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Margin Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Budget Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Client Budget</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">฿</span>
                  <Input
                    type="number"
                    value={clientBudget}
                    onChange={(e) => setClientBudget(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">KOL Tier</label>
                <div className="flex flex-wrap gap-2">
                  {tierComparison.map((t) => (
                    <Button
                      key={t.tier}
                      variant={selectedTier === t.tier.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTier(t.tier.toLowerCase())}
                    >
                      {t.tier}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Base rate: {formatCurrency(unitRate)} per KOL
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quantity: {quantity}
                </label>
                <Slider
                  value={[quantity]}
                  onValueChange={(v) => setQuantity(v[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Markup: {markup}%
                </label>
                <Slider
                  value={[markup]}
                  onValueChange={(v) => setMarkup(v[0])}
                  min={20}
                  max={100}
                  step={5}
                />
              </div>
            </div>

            {/* Results */}
            <div className="p-6 rounded-lg bg-muted space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                <p className="text-4xl font-bold font-mono">{formatCurrency(clientCost)}</p>
                <Badge
                  variant={clientCost <= clientBudget ? "default" : "destructive"}
                  className="mt-2"
                >
                  {clientCost <= clientBudget ? "Within Budget" : "Over Budget"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Our Cost</p>
                  <p className="text-lg font-mono">{formatCurrency(ourCost)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Margin</p>
                  <p className="text-lg font-mono text-green-500">{formatCurrency(margin)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Margin %</span>
                  <span className="font-bold">{markup}%</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Budget Remaining</span>
                  <span className={clientBudget - clientCost >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatCurrency(clientBudget - clientCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2025 Rate Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Service</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Client Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Our Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Margin</th>
                </tr>
              </thead>
              <tbody>
                {contentTypes.map((service) => (
                  <tr key={service.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <p className="font-medium">{service.name}</p>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {formatCurrency(service.baseRate)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-muted-foreground">
                      {formatCurrency(service.baseRate / 2)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-green-500">
                      50%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
