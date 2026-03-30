"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  ExternalLink,
  Users,
  Eye,
  ChevronDown,
  Cpu,
  Mail,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { TechKOL } from "@/lib/cached-data";

type SortKey = "followers" | "views" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "views", label: "Views" },
  { key: "name", label: "Name" },
];

interface TechKOLClientProps {
  kols: TechKOL[];
  total: number;
}

export function TechKOLClient({ kols, total: _total }: TechKOLClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("followers");
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return kols;
    const q = searchQuery.toLowerCase();
    return kols.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.handle.toLowerCase().includes(q) ||
        k.specialization.some((s) => s.toLowerCase().includes(q))
    );
  }, [kols, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        const cmp = (a.name || a.handle).localeCompare(b.name || b.handle);
        return sortDesc ? -cmp : cmp;
      }
      const va = sortBy === "followers" ? a.followers : a.views;
      const vb = sortBy === "followers" ? b.followers : b.views;
      return sortDesc ? vb - va : va - vb;
    });
  }, [filtered, sortBy, sortDesc]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tech Creators</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tech, automation, and data engineering content creators
          </p>
        </div>
        <div className="flex items-baseline gap-4 sm:text-right">
          <Stat label="Creators" value={formatNumber(filtered.length)} />
          <Stat label="Total Followers" value={formatNumber(filtered.reduce((s, k) => s + k.followers, 0))} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                if (sortBy === opt.key) setSortDesc(!sortDesc);
                else { setSortBy(opt.key); setSortDesc(true); }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
              {sortBy === opt.key && (
                <ChevronDown className={`w-3 h-3 ml-0.5 inline transition-transform ${!sortDesc ? "rotate-180" : ""}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sorted.map((kol) => (
          <TechKOLCard key={kol.id} kol={kol} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20">
          <Cpu className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No tech creators found</p>
        </div>
      )}
    </div>
  );
}

function TechKOLCard({ kol }: { kol: TechKOL }) {
  const socials = [
    kol.urls.tiktok && { label: "TikTok", url: kol.urls.tiktok },
    kol.urls.instagram && { label: "Instagram", url: kol.urls.instagram },
    kol.urls.youtube && { label: "YouTube", url: kol.urls.youtube },
    kol.urls.facebook && { label: "Facebook", url: kol.urls.facebook },
    kol.urls.x && { label: "X", url: kol.urls.x },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate">{kol.name || kol.handle}</h3>
            {kol.handle && <p className="text-xs text-muted-foreground">@{kol.handle}</p>}
            {kol.collaborationStage && (
              <Badge variant="outline" className="text-[10px] mt-1">{kol.collaborationStage}</Badge>
            )}
          </div>
          {kol.profileImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={kol.profileImage}
              alt={kol.name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              loading="lazy"
            />
          )}
        </div>

        {kol.specialization.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {kol.specialization.map((s) => (
              <Badge key={s} className="text-[10px] px-1.5 py-0">{s}</Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/40">
          <MiniStat icon={<Users className="w-3 h-3" />} value={formatNumber(kol.followers)} label="Followers" />
          <MiniStat icon={<Eye className="w-3 h-3" />} value={formatNumber(kol.views)} label="Views" />
          <MiniStat icon={<Cpu className="w-3 h-3" />} value={`${kol.liveNum + kol.videoNum}`} label="Content" />
        </div>

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {s.label}
              </a>
            ))}
          </div>
        )}

        {(kol.contact.email || kol.contact.phone) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/40">
            {kol.contact.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 shrink-0" /> {kol.contact.email}
              </span>
            )}
            {kol.contact.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" /> {kol.contact.phone}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className="text-base sm:text-lg font-mono font-bold leading-tight truncate">{value}</p>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">{icon}</div>
      <p className="text-xs font-bold font-mono">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
