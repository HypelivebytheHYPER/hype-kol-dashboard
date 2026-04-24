"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import type { LiveMC } from "@/lib/types/catalog";

interface MCRequestFormProps {
  selectedMCs: LiveMC[];
  onClose: () => void;
  onSuccess: () => void;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function MCRequestForm({ selectedMCs, onClose, onSuccess }: MCRequestFormProps) {
  const [campaignName, setCampaignName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/mc-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedMCs: selectedMCs.map((mc) => mc.handle),
          campaignName,
          clientName,
          clientEmail,
          clientPhone,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Submission failed");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="size-16 text-chart-2 mb-4" />
        <h3 className="text-xl font-semibold">Request Submitted!</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          We will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Selected MCs summary */}
      <div>
        <label className="text-sm font-medium mb-2 block">Selected MCs ({selectedMCs.length})</label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {selectedMCs.map((mc) => (
            <span
              key={mc.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
            >
              {mc.handle}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Your Name <span className="text-destructive">*</span>
          </label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={status === "loading"}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Campaign Name</label>
          <Input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Summer 2026 Campaign"
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="john@company.com"
            disabled={status === "loading"}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Phone</label>
          <Input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+66 8x xxx xxxx"
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us about your campaign, budget, timeline..."
          rows={4}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          disabled={status === "loading"}
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={status === "loading"}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 gap-2"
          disabled={status === "loading" || !clientName.trim()}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
