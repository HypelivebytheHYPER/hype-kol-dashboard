"use client";

import { useState } from "react";
import { Map, TrendingUp, Users, DollarSign, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";

const mediaOptions = [
  {
    id: "digital_100",
    name: "100% Digital (KOLs)",
    digital: 100,
    ooh: 0,
    reach: 5000000,
    frequency: 3.2,
    cpm: 200,
  },
  {
    id: "mixed_70_30",
    name: "70% Digital + 30% OOH",
    digital: 70,
    ooh: 30,
    reach: 7000000,
    frequency: 2.1,
    cpm: 143,
    recommended: true,
  },
  {
    id: "mixed_50_50",
    name: "50% Digital + 50% OOH",
    digital: 50,
    ooh: 50,
    reach: 8000000,
    frequency: 1.6,
    cpm: 125,
    recommended: true,
  },
];

const oohOptions = [
  { id: "bts", name: "BTS Skytrain", coverage: "Bangkok CBD", price: 450000 },
  { id: "billboard", name: "Billboard", coverage: "Rama 9 / Sukhumvit", price: 280000 },
  { id: "bus", name: "Bus Wrap", coverage: "Bangkok Metro", price: 120000 },
  { id: "mall", name: "Mall Digital Screen", coverage: "Major Malls", price: 85000 },
];

export default function MediaPlannerPage() {
  const [budget, setBudget] = useState(1000000);
  const [selectedOption, setSelectedOption] = useState(mediaOptions[1]);

  const digitalBudget = budget * (selectedOption.digital / 100);
  const oohBudget = budget * (selectedOption.ooh / 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display font-bold">OOH Media Planner</h1>
        <p className="text-muted-foreground mt-1">
          Integrated KOL + outdoor media planning
        </p>
      </div>

      {/* Budget Slider */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Total Budget</label>
            <span className="text-2xl font-bold font-mono">
              {formatCurrency(budget)}
            </span>
          </div>
          <Slider
            value={[budget]}
            onValueChange={(v) => setBudget(v[0])}
            min={100000}
            max={5000000}
            step={50000}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>฿100K</span>
            <span>฿5M</span>
          </div>
        </CardContent>
      </Card>

      {/* Media Mix Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mediaOptions.map((option) => (
          <Card
            key={option.id}
            className={`card-hover cursor-pointer ${
              selectedOption.id === option.id ? "border-primary" : ""
            }`}
            onClick={() => setSelectedOption(option)}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{option.name}</h3>
                {option.recommended && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    Recommended
                  </Badge>
                )}
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${option.digital}%` }}
                />
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${option.ooh}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Reach</p>
                  <p className="font-mono font-semibold">{formatNumber(option.reach)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Frequency</p>
                  <p className="font-mono font-semibold">{option.frequency}x</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CPM</p>
                  <p className="font-mono font-semibold">฿{option.cpm}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Efficiency</p>
                  <p className={`font-mono font-semibold ${option.cpm < 150 ? "text-green-500" : ""}`}>
                    {option.cpm < 150 ? "High" : "Medium"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Digital (KOLs)</span>
                  </div>
                  <span className="font-mono font-semibold">
                    {formatCurrency(digitalBudget)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${selectedOption.digital}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedOption.digital}% of total budget
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-amber-500" />
                    <span>OOH Media</span>
                  </div>
                  <span className="font-mono font-semibold">
                    {formatCurrency(oohBudget)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${selectedOption.ooh}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedOption.ooh}% of total budget
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">OOH Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {oohOptions.map((ooh) => (
                <div
                  key={ooh.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{ooh.name}</p>
                    <p className="text-sm text-muted-foreground">{ooh.coverage}</p>
                  </div>
                  <span className="font-mono font-semibold">
                    {formatCurrency(ooh.price)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
