"use client";

import { SECTION_HEADER } from "@/lib/design-tokens";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  count?: number;
}

export function SectionHeader({ icon: Icon, title, count }: SectionHeaderProps) {
  return (
    <div className={SECTION_HEADER.base}>
      <Icon className={SECTION_HEADER.icon} />
      <h3 className={SECTION_HEADER.label}>
        {title}
        {count !== undefined && ` (${count})`}
      </h3>
    </div>
  );
}
