"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";

interface NotificationButtonProps {
  className?: string;
}

export function NotificationButton({ className }: NotificationButtonProps) {
  const { t } = useI18n();

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      title={t("header.notifications")}
    >
      <Bell />
      <span className="absolute top-1 right-1 size-2 bg-destructive rounded-full" />
    </Button>
  );
}
