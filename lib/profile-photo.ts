"use client";

import { useState, useEffect } from "react";
import type { Creator } from "./types/catalog";

/** Derive a profile page URL from creator data. */
export function getProfilePageUrl(kol: Creator): string | null {
  const platform = kol.platform?.toLowerCase() ?? "";

  const isDirectProfileUrl = (url: string): boolean => {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      return host.includes("tiktok.com") || host.includes("instagram.com");
    } catch {
      return false;
    }
  };

  if (kol.channel && isDirectProfileUrl(kol.channel)) return kol.channel;
  if (kol.sourceUrl && isDirectProfileUrl(kol.sourceUrl)) return kol.sourceUrl;

  if (kol.handle) {
    if (platform === "tiktok") return `https://www.tiktok.com/@${kol.handle}`;
    if (platform === "instagram") return `https://www.instagram.com/${kol.handle}/`;
  }

  if (kol.channel) return kol.channel;
  if (kol.sourceUrl) return kol.sourceUrl;

  return null;
}

/** React hook that returns the best available profile photo for a KOL. */
export function useProfilePhoto(kol: Creator): { imageUrl: string | null; isLoading: boolean } {
  const storedImage = kol.image || null;
  const [imageUrl, setImageUrl] = useState<string | null>(storedImage);

  useEffect(() => {
    if (storedImage) return;

    const profileUrl = getProfilePageUrl(kol);
    if (!profileUrl) return;

    let cancelled = false;

    fetch(`/api/profile-photo?url=${encodeURIComponent(profileUrl)}`)
      .then((res) => (res.ok ? res.json() : Promise.resolve({ photoUrl: null })))
      .then((data: { photoUrl?: string | null }) => {
        if (!cancelled) setImageUrl(data.photoUrl || null);
      })
      .catch(() => {
        if (!cancelled) setImageUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [kol.id, storedImage]);

  return { imageUrl, isLoading: !storedImage && imageUrl === null };
}
