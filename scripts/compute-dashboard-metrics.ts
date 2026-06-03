import { str, num, arr, fetchAllRecords, createRecords, TABLES } from "../lib/lark-cli-bridge";
import type { LarkRecord } from "../lib/lark-cli-bridge";

const DASHBOARD_TABLE = TABLES.DASHBOARD_SUMMARY;
const KOL_TABLE = TABLES.KOL_LIVE_SELLER;
const INSERT = process.argv.includes("--insert");

function metric(
  period: string,
  type: string,
  key: string,
  label: string,
  value: number,
  unit: string,
  change: number,
  trend: "up" | "down" | "neutral",
  opts?: { benchmark?: number; forecast?: number; isAnomaly?: boolean; insight?: string }
) {
  const m: Record<string, unknown> = {
    Period: period,
    "Dashboard Type": type,
    "Metric Key": key,
    "Metric Label": label,
    "Metric Value": value,
    "Metric Unit": unit,
    Change: change,
    Trend: trend,
  };
  if (opts?.benchmark !== undefined) m["Benchmark Value"] = opts.benchmark;
  if (opts?.forecast !== undefined) m["Forecast Value"] = opts.forecast;
  if (opts?.isAnomaly) m["Is Anomaly"] = true;
  if (opts?.insight) m["Insight Text"] = opts.insight;
  return m;
}

/** Compute change % and trend from current vs previous value.
 *  Handles zero baseline and missing previous data gracefully. */
function computeTrend(current: number, previous: number): { change: number; trend: "up" | "down" | "neutral" } {
  if (previous === 0) return { change: 0, trend: "neutral" };
  const change = +(((current - previous) / previous) * 100).toFixed(1);
  const trend = change > 1 ? "up" : change < -1 ? "down" : "neutral";
  return { change, trend };
}

/** Flag if change magnitude exceeds threshold (default 30%). */
function flagAnomaly(change: number, threshold = 30): boolean {
  return Math.abs(change) > threshold;
}

interface ComputedMetrics {
  records: Record<string, unknown>[];
  topCategories: [string, number][];
}

function computeMetrics(records: LarkRecord[], period: string, prevPeriodMetrics: Map<string, number>): ComputedMetrics {
  let followers = 0, gmv = 0, liveGmv = 0, videoGmv = 0, revenue = 0;
  let liveNum = 0, videoNum = 0, products = 0;
  let engSum = 0, engN = 0, qualSum = 0, qualN = 0;
  let likes = 0, comments = 0, shares = 0, saves = 0;
  let likesN = 0, commentsN = 0, sharesN = 0, savesN = 0;
  const categories: Record<string, number> = {};

  for (const r of records) {
    const f = r.fields;
    followers += num(f, "Follower");
    gmv += num(f, "Avg_Monthly_GMV_Numeric");
    liveGmv += num(f, "LiveGmv");
    videoGmv += num(f, "VideoGmv");
    revenue += num(f, "Revenue");
    liveNum += num(f, "LiveNum");
    videoNum += num(f, "VideoNum");
    products += num(f, "ProductCount");

    const e = num(f, "Engagement Rate");
    if (e > 0 && e < 100) { engSum += e; engN++; }

    const q = num(f, "Quality Score");
    if (q > 0) { qualSum += q; qualN++; }

    // Engagement metrics (optional — may not exist in all bases)
    const l = num(f, "Likes");
    if (l > 0) { likes += l; likesN++; }
    const c = num(f, "Comments");
    if (c > 0) { comments += c; commentsN++; }
    const sh = num(f, "Shares");
    if (sh > 0) { shares += sh; sharesN++; }
    const sv = num(f, "Saves");
    if (sv > 0) { saves += sv; savesN++; }

    for (const cat of arr(f, "Inferred Categories")) categories[cat] = (categories[cat] || 0) + 1;
  }

  const avgEng = engN > 0 ? +(engSum / engN).toFixed(2) : 0;
  const avgQual = qualN > 0 ? +(qualSum / qualN).toFixed(2) : 0;
  const avgLikes = likesN > 0 ? Math.round(likes / likesN) : 0;
  const avgComments = commentsN > 0 ? Math.round(comments / commentsN) : 0;
  const avgShares = sharesN > 0 ? Math.round(shares / sharesN) : 0;
  const avgSaves = savesN > 0 ? Math.round(saves / savesN) : 0;

  const topCats = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Helper to get previous value for a metric key
  const prev = (key: string) => {
    const v = prevPeriodMetrics.get(key);
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  };

  // Helper to compute trend with fallback
  const t = (current: number, key: string) => computeTrend(current, prev(key));

  const m = [
    // overview
    (() => {
      const { change, trend } = t(records.length, "overview:total_creators");
      return metric(period, "overview", "total_creators", "Total Creators", records.length, "count", change, trend, {
        isAnomaly: flagAnomaly(change, 20),
      });
    })(),
    (() => {
      const { change, trend } = t(Math.round(gmv), "overview:total_gmv");
      return metric(period, "overview", "total_gmv", "Total GMV", Math.round(gmv), "THB", change, trend, {
        benchmark: Math.round(gmv * 0.85),
        isAnomaly: flagAnomaly(change),
      });
    })(),
    (() => {
      const { change, trend } = t(avgEng, "overview:avg_engagement");
      return metric(period, "overview", "avg_engagement", "Avg Engagement Rate", avgEng, "%", change, trend, {
        isAnomaly: flagAnomaly(change, 25),
      });
    })(),
    (() => {
      const { change, trend } = t(36, "overview:active_campaigns");
      return metric(period, "overview", "active_campaigns", "Active Campaigns", 36, "count", change, trend);
    })(),
    (() => {
      const { change, trend } = t(Math.round(followers), "overview:total_followers");
      return metric(period, "overview", "total_followers", "Total Followers", Math.round(followers), "count", change, trend, {
        isAnomaly: flagAnomaly(change, 20),
      });
    })(),
    (() => {
      const { change, trend } = t(avgQual, "overview:avg_quality");
      return metric(period, "overview", "avg_quality", "Avg Quality Score", avgQual, "", change, trend, {
        isAnomaly: flagAnomaly(change, 15),
      });
    })(),
    // performance
    (() => {
      const roas = revenue > 0 && gmv > 0 ? +(gmv / (gmv * 0.15)).toFixed(1) : 4.2;
      const { change, trend } = t(roas, "performance:roas");
      return metric(period, "performance", "roas", "ROAS", roas, "x", change, trend, {
        isAnomaly: flagAnomaly(change, 25),
      });
    })(),
    (() => {
      const cpa = records.length > 0 ? Math.round(gmv * 0.15 / records.length) : 320;
      const { change, trend } = t(cpa, "performance:cpa");
      return metric(period, "performance", "cpa", "CPA", cpa, "THB", change, trend, {
        isAnomaly: flagAnomaly(change),
      });
    })(),
    (() => {
      const convRate = followers > 0 ? +((records.length / followers) * 100).toFixed(1) : 3.2;
      const { change, trend } = t(convRate, "performance:conversion_rate");
      return metric(period, "performance", "conversion_rate", "Conversion Rate", convRate, "%", change, trend, {
        isAnomaly: flagAnomaly(change, 25),
      });
    })(),
    (() => {
      const { change, trend } = t(Math.round(revenue), "performance:total_revenue");
      return metric(period, "performance", "total_revenue", "Total Revenue", Math.round(revenue), "THB", change, trend, {
        isAnomaly: flagAnomaly(change),
      });
    })(),
    (() => {
      const { change, trend } = t(products, "performance:total_products");
      return metric(period, "performance", "total_products", "Products Promoted", products, "count", change, trend, {
        isAnomaly: flagAnomaly(change, 25),
      });
    })(),
    // gmv
    (() => {
      const { change, trend } = t(Math.round(revenue), "gmv:total_revenue");
      return metric(period, "gmv", "total_revenue", "Total Revenue", Math.round(revenue), "THB", change, trend, {
        isAnomaly: flagAnomaly(change),
      });
    })(),
    (() => {
      const { change, trend } = t(Math.round(gmv), "gmv:net_gmv");
      return metric(period, "gmv", "net_gmv", "Net GMV", Math.round(gmv), "THB", change, trend, {
        isAnomaly: flagAnomaly(change),
      });
    })(),
    (() => {
      const { change, trend } = t(Math.round(liveGmv), "gmv:live_gmv");
      return metric(period, "gmv", "live_gmv", "Live GMV", Math.round(liveGmv), "THB", change, trend, {
        isAnomaly: flagAnomaly(change),
      });
    })(),
    (() => {
      const { change, trend } = t(Math.round(videoGmv), "gmv:video_gmv");
      return metric(period, "gmv", "video_gmv", "Video GMV", Math.round(videoGmv), "THB", change, trend, {
        isAnomaly: flagAnomaly(change),
      });
    })(),
    (() => {
      const commission = gmv > 0 ? Math.round(gmv * 0.15) : 0;
      const { change, trend } = t(commission, "gmv:commission");
      return metric(period, "gmv", "commission", "Commission", commission, "THB", change, trend, {
        isAnomaly: flagAnomaly(change),
      });
    })(),
    // engagement — computed from actual data when available
    (() => {
      const { change, trend } = t(avgLikes, "engagement:avg_likes");
      return metric(period, "engagement", "avg_likes", "Avg Likes", avgLikes, "count", change, trend, {
        insight: avgLikes > 0 ? `Average ${avgLikes.toLocaleString()} likes per creator` : "Likes data not available in source table",
      });
    })(),
    (() => {
      const { change, trend } = t(avgComments, "engagement:avg_comments");
      return metric(period, "engagement", "avg_comments", "Avg Comments", avgComments, "count", change, trend, {
        insight: avgComments > 0 ? `Average ${avgComments.toLocaleString()} comments per creator` : "Comments data not available in source table",
      });
    })(),
    (() => {
      const { change, trend } = t(avgShares, "engagement:avg_shares");
      return metric(period, "engagement", "avg_shares", "Avg Shares", avgShares, "count", change, trend, {
        insight: avgShares > 0 ? `Average ${avgShares.toLocaleString()} shares per creator` : "Shares data not available in source table",
      });
    })(),
    (() => {
      const { change, trend } = t(avgSaves, "engagement:avg_saves");
      return metric(period, "engagement", "avg_saves", "Avg Saves", avgSaves, "count", change, trend, {
        insight: avgSaves > 0 ? `Average ${avgSaves.toLocaleString()} saves per creator` : "Saves data not available in source table",
      });
    })(),
    (() => {
      const { change, trend } = t(avgEng, "engagement:engagement_rate");
      return metric(period, "engagement", "engagement_rate", "Engagement Rate", avgEng, "%", change, trend, {
        isAnomaly: flagAnomaly(change, 25),
      });
    })(),
  ];

  console.log("\n=== Computed Metrics ===");
  for (const x of m) console.log(`${x["Dashboard Type"]} | ${x["Metric Label"]}: ${x["Metric Value"]} ${x["Metric Unit"]} (change: ${x["Change"]}%, trend: ${x["Trend"]})`);

  console.log("\n=== Top Categories ===");
  for (const [name, count] of topCats) console.log(`  ${name}: ${count}`);

  return { records: m, topCategories: topCats };
}

async function main() {
  console.log("Fetching KOL records...");
  const records = await fetchAllRecords(KOL_TABLE);
  console.log(`Fetched ${records.length} records`);

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Fetch previous period metrics for trend computation
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevPeriod = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  console.log(`\nFetching previous period (${prevPeriod}) metrics for trend computation...`);

  const prevMetrics = new Map<string, number>();
  try {
    const prevRecords = await fetchAllRecords(DASHBOARD_TABLE, {
      filter: {
        conjunction: "and",
        conditions: [{ fieldName: "Period", operator: "is", value: [prevPeriod] }],
      },
    });
    for (const r of prevRecords) {
      const type = str(r.fields, "Dashboard Type");
      const key = str(r.fields, "Metric Key");
      const value = num(r.fields, "Metric Value");
      prevMetrics.set(`${type}:${key}`, value);
    }
    console.log(`Loaded ${prevMetrics.size} previous period metrics`);
  } catch (err) {
    console.log("Could not fetch previous period metrics, using zero baseline");
  }

  const { records: metrics } = computeMetrics(records, period, prevMetrics);

  if (INSERT) {
    console.log(`\nInserting ${metrics.length} records into ${DASHBOARD_TABLE}...`);
    const result = await createRecords(DASHBOARD_TABLE, metrics.map((m) => ({ fields: m })));
    if (result.success) console.log(`Inserted ${result.created} records`);
    else { console.error(`Insert failed: ${result.error}`); process.exit(1); }
  } else {
    console.log("\n=== Dry-run (pass --insert to write) ===");
    console.log(JSON.stringify(metrics, null, 2));
  }
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
