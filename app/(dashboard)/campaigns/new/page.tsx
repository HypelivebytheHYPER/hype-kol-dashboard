"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const objectives = [
  { id: "brand_awareness", label: "Brand Awareness", description: "Increase brand visibility" },
  { id: "direct_sales", label: "Direct Sales", description: "Drive immediate purchases" },
  { id: "product_launch", label: "Product Launch", description: "Introduce new products" },
  { id: "engagement", label: "Engagement", description: "Boost social interactions" },
  { id: "long_term", label: "Long-term Partnership", description: "Ongoing collaboration" },
];

const steps = [
  { id: 1, title: "Objective & Audience" },
  { id: 2, title: "Budget & Timeline" },
  { id: 3, title: "KOL Selection" },
  { id: 4, title: "Review & Launch" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    objectives: [] as string[],
    budget: "",
    startDate: "",
    endDate: "",
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleObjective = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.includes(id)
        ? prev.objectives.filter((o) => o !== id)
        : [...prev.objectives, id],
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-title font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.id < currentStep
                  ? "bg-green-500 text-white"
                  : step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${step.id < currentStep ? "bg-green-500" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Name</label>
                <Input
                  placeholder="e.g., Summer Beauty Collection Launch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Brand</label>
                <Input
                  placeholder="e.g., L'Oreal Paris"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Objectives</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {objectives.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        formData.objectives.includes(obj.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <p className="font-medium">{obj.label}</p>
                      <p className="text-sm text-muted-foreground">{obj.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Total Budget (THB)</label>
                <Input
                  type="number"
                  placeholder="250000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">KOL selection interface will be shown here.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Search and filter KOLs to add to this campaign.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-4">Campaign Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{formData.name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand</span>
                    <span>{formData.brand || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Objectives</span>
                    <div className="flex gap-1">
                      {formData.objectives.map((o) => (
                        <Badge key={o} variant="secondary" className="text-[10px]">
                          {o}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span>฿{formData.budget || "0"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex-1 sm:flex-none"
        >
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1 sm:flex-none">
          {currentStep === steps.length ? "Launch Campaign" : "Next"}
          {currentStep < steps.length && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
