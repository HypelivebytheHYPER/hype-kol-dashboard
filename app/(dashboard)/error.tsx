"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">Failed to load dashboard</h2>
          <p className="text-muted-foreground text-sm">
            We couldn&apos;t load this page. Please try again or go back to the dashboard.
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button size="sm" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
