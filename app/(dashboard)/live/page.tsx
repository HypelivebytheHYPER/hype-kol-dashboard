import type { Metadata } from "next";
import { fetchRecords, fetchView, resolveRecordAttachments, str, arr, attachments, TABLES, VIEWS } from "@/lib/lark-cli-bridge";
import { getMCContentCategories } from "@/lib/taxonomy";
import type { LiveMC } from "@/lib/types";
import { LiveCatalogClient } from "./_components/live-catalog-client";
import { LIVE_CATALOG_PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Live MC Catalog",
  description: "Browse live MCs with media references and brand experience.",
  alternates: { canonical: "https://hype-kol-dashboard.vercel.app/live" },
};

export const revalidate = 300;

const isVideo = (n: string, t?: string) => /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(n) || (!!t && t.startsWith("video/"));
const isImage = (n: string, t?: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(n) || (!!t && t.startsWith("image/"));

export default async function LiveCatalogPage() {
  const view = await fetchView(TABLES.LIVE_MC_LIST, VIEWS.MC_ALL);
  if (!view) {
    console.error(`[LiveCatalog] View ${VIEWS.MC_ALL} not found or inaccessible`);
    return <LiveCatalogClient mcs={[]} />;
  }

  const res = await fetchRecords(TABLES.LIVE_MC_LIST, { viewId: VIEWS.MC_ALL, pageSize: LIVE_CATALOG_PAGE_SIZE });

  // First pass: build MC objects + collect cover tokens
  const mcs: LiveMC[] = [];
  const coverTokens = new Map<string, string>(); // recordId -> cover file_token

  for (const r of res.data) {
    const f = r.fields;
    const refs = attachments(f, "Media");
    const videos = refs
      .filter((a) => isVideo(a.name, a.type))
      .map((v) => ({ token: v.file_token, url: "", name: v.name }));
    const cover = videos.length === 0 ? refs.find((a) => isImage(a.name, a.type)) : undefined;

    const mc: LiveMC = {
      id: r.record_id,
      handle: str(f, "Handle"),
      brands: arr(f, "Brand"),
      contentCategories: getMCContentCategories(arr(f, "Brand")),
      videos,
    };
    if (cover) coverTokens.set(r.record_id, cover.file_token);
    mcs.push(mc);
  }

  // Resolve all media URLs in one batch
  const resolved = await resolveRecordAttachments(res.data, {
    tableId: TABLES.LIVE_MC_LIST,
    fieldName: "Media",
  });

  // Inject resolved URLs
  for (const mc of mcs) {
    const media = resolved.get(mc.id) ?? [];
    const urlByToken = new Map(media.map((m) => [m.token, m.url]));
    for (const v of mc.videos) {
      const u = urlByToken.get(v.token);
      if (u) v.url = u;
    }
    const coverToken = coverTokens.get(mc.id);
    if (coverToken) {
      const coverUrl = urlByToken.get(coverToken);
      if (coverUrl) mc.coverUrl = coverUrl;
    }
  }

  return <LiveCatalogClient mcs={mcs} />;
}
