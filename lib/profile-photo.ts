"use client";

import { useState, useEffect, useRef } from "react";
import type { Creator } from "./types/catalog";

/** Global in-memory cache for profile photo URLs — prevents duplicate fetches. */
const photoCache = new Map<string, string | null>();
const pendingFetches = new Map<string, Promise<string | null>>();

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

/** Check if a TikTok CDN URL has expired.
 *  TikTok CDN URLs contain x-expires (unix timestamp) and x-signature.
 *  We consider a URL expired if x-expires is within 1 hour of now. */
function isExpiredTikTokCdn(url: string): boolean {
  if (!/tiktokcdn[\w-]*\.com/.test(url)) return false;
  const expiresMatch = url.match(/[?&]x-expires=(\d+)/);
  if (!expiresMatch) return false; // no expiry = not a signed URL, probably still valid
  const expiresAt = parseInt(expiresMatch[1], 10) * 1000;
  const oneHour = 60 * 60 * 1000;
  return expiresAt < Date.now() + oneHour;
}

async function fetchPhoto(profileUrl: string): Promise<string | null> {
  if (pendingFetches.has(profileUrl)) {
    return pendingFetches.get(profileUrl)!;
  }

  const promise = fetch(`/api/profile-photo?url=${encodeURIComponent(profileUrl)}`)
    .then((res) => (res.ok ? res.json() : Promise.resolve({ photoUrl: null })))
    .then((data: { photoUrl?: string | null }) => data.photoUrl || null)
    .catch(() => null);

  pendingFetches.set(profileUrl, promise);
  const result = await promise;
  pendingFetches.delete(profileUrl);
  return result;
}

/** React hook that returns the best available profile photo for a KOL.
 *  Eagerly fetches fresh avatars for expired TikTok CDN URLs.
 *  If `freshPhoto` is provided (from batch fetch), uses it directly. */
export function useProfilePhoto(
  kol: Creator,
  freshPhoto?: string
): { imageUrl: string | null; isLoading: boolean } {
  const storedImage = kol.image || null;
  const canUseStored = storedImage && !isExpiredTikTokCdn(storedImage);

  const cacheKey = `${kol.platform}-${kol.handle}`;
  const cached = photoCache.get(cacheKey);
  const profileUrl = getProfilePageUrl(kol);

  const [imageUrl, setImageUrl] = useState<string | null>(
    freshPhoto ? freshPhoto : canUseStored ? storedImage : cached ?? null
  );
  const [isLoading, setIsLoading] = useState(
    freshPhoto ? false : !canUseStored && cached === undefined
  );
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (freshPhoto) {
      setImageUrl(freshPhoto);
      setIsLoading(false);
      return;
    }

    if (canUseStored) {
      setImageUrl(storedImage);
      setIsLoading(false);
      return;
    }

    if (photoCache.has(cacheKey)) {
      setImageUrl(photoCache.get(cacheKey) ?? null);
      setIsLoading(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (!profileUrl) {
      photoCache.set(cacheKey, null);
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchPhoto(profileUrl).then((url) => {
      photoCache.set(cacheKey, url);
      setImageUrl(url);
      setIsLoading(false);
    });
  }, [kol.id, canUseStored, storedImage, cacheKey, profileUrl, freshPhoto]);

  return { imageUrl, isLoading };
}
