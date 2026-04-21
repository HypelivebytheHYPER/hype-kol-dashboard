// Two independent taxonomies live here:
//
//   1. Creator niches — 26 self-declared categories, sourced from the Lark
//      "Inferred Categories" multi-select field. Used by Creator and LiveMC
//      records via normalizeCategories().
//
//   2. Content categories — 6 content types derived from a creator's brand
//      portfolio (cosmetics, health, food, home, fashion, personal-care).
//      Used by /live for filtering and the wire-map for brand grouping.
//
// Some IDs overlap by coincidence ("health", "food", "home", "fashion"), but
// the two taxonomies are independent: creators tag their OWN niches; brands
// get mapped to content categories by BRAND_CONTENT_MAP below.

// ============ 1. Creator niches (Lark "Inferred Categories") ============

export const CATEGORY_FIELD = "Inferred Categories";

// Mirrors Lark's `Inferred Categories` option set verbatim (25 options, verified
// 2026-04-21 via `lark-cli base +field-list`). Lark IS the source of truth —
// when new options are added upstream, they should be added here too, otherwise
// `normalizeCategories` silently drops them.
const CREATOR_CATEGORIES = [
  "Food", "Seafood", "FMCG",
  "Beauty", "Skincare",
  "Fashion", "Clothing", "Jewelry", "Accessories",
  "Tech", "Gadgets",
  "Health", "Wellness", "Fitness",
  "Home", "Lifestyle", "Shopping", "Retail",
  "Mom", "Kids", "Pet",
  "Sports", "Travel",
  "Organic", "Local",
] as const;

type CreatorCategoryId = (typeof CREATOR_CATEGORIES)[number];

// Case-insensitive raw Lark value → canonical ID. Identity mapping today
// since Lark's option labels already match our IDs; kept as a lookup so
// future aliases can be added without changing call sites.
const CREATOR_ALIASES: Record<string, CreatorCategoryId> = Object.fromEntries(
  CREATOR_CATEGORIES.map((id) => [id.toLowerCase(), id])
);

export function normalizeCategories(raw: string[]): CreatorCategoryId[] {
  return raw
    .map((r) => CREATOR_ALIASES[r.toLowerCase().trim()])
    .filter((c): c is CreatorCategoryId => c !== undefined);
}

// ============ 2. Content categories (derived from brand portfolio) ============

export const CONTENT_CATEGORIES = [
  { id: "cosmetics", label: "Cosmetics & Beauty", color: "#f472b6" },
  { id: "health", label: "Health & Supplements", color: "#34d399" },
  { id: "food", label: "Food & Beverage", color: "#fbbf24" },
  { id: "home", label: "Home & Living", color: "#60a5fa" },
  { id: "fashion", label: "Fashion & Apparel", color: "#a78bfa" },
  { id: "personal-care", label: "Personal Care", color: "#fb923c" },
] as const;

export type ContentCategoryId = (typeof CONTENT_CATEGORIES)[number]["id"];

// Brand name (exact match from Lark) → content categories
const BRAND_CONTENT_MAP: Record<string, ContentCategoryId[]> = {
  // Cosmetics & Beauty
  "Banila Co": ["cosmetics"],
  "Revlon": ["cosmetics"],
  "Babalah": ["cosmetics"],
  "Cathy Doll": ["cosmetics"],
  "Glory": ["cosmetics"],
  "Madam Lisa": ["cosmetics"],
  "Desire You": ["cosmetics"],
  "Kathy Cosmetic": ["cosmetics"],
  "odbo": ["cosmetics"],
  "Naked": ["cosmetics"],
  "Cosrx": ["cosmetics"],
  "Sistar": ["cosmetics"],
  "De Leaf Thanaka": ["cosmetics"],
  "MOD S": ["cosmetics"],
  "deNAX Thailand": ["cosmetics"],
  "DeLaLita": ["cosmetics"],
  "Loreal": ["cosmetics"],
  "Garnier": ["cosmetics"],
  "Srichand": ["cosmetics"],
  "Konvy": ["cosmetics"],
  "Oriental Princess": ["cosmetics"],
  "Sasi": ["cosmetics"],
  "BioEssence": ["cosmetics"],
  "ETUDE": ["cosmetics"],
  "LumeDaily": ["cosmetics"],
  "Barenbliss": ["cosmetics"],
  "ฺBSC": ["cosmetics"],
  "Skin1004": ["cosmetics"],
  "Estee Lauder": ["cosmetics"],
  "CERAVE": ["cosmetics", "personal-care"],
  "Skin365": ["cosmetics"],
  "Kunami": ["cosmetics"],
  "Chillab": ["cosmetics"],
  "Chame": ["cosmetics"],
  "Darling & Co": ["cosmetics"],

  // Health & Supplements
  "Vistra": ["health"],
  "Swisse": ["health"],
  "Supersup": ["health"],
  "Protriva": ["health"],
  "Winly": ["health"],
  "Sappe": ["health"],
  "SkiinVit": ["health"],
  "Skinoxy": ["health"],
  "Vita Natureplus": ["health"],
  "Livmore": ["health"],
  "Welluo": ["health"],
  "SHRD Hair Care": ["health"],
  "Plante": ["health", "personal-care"],
  "VidAway": ["health"],

  // Food & Beverage
  "Danongwon Thailand": ["food"],
  "Nestle": ["food"],
  "Nescafe": ["food"],
  "Foremost": ["food"],
  "Doikham": ["food"],
  "Lays": ["food"],
  "OTOP": ["food"],
  "Orista Thailand": ["food"],
  "TopValue": ["food"],

  // Home & Living
  "3M": ["home"],
  "LocknLock": ["home"],
  "Makro": ["home"],
  "Pasaya": ["home"],
  "Zaap On Sale": ["home"],

  // Fashion & Apparel
  "Wacoal": ["fashion"],
  "Runway": ["fashion"],
  "Misslens": ["fashion"],
  "Supersport": ["fashion"],
  "Her Nae": ["fashion"],
  "Matchbox": ["fashion"],
  "Wanika": ["fashion"],

  // Personal Care
  "Nivea": ["personal-care"],
  "Cetaphil": ["personal-care"],
  "Eucerin": ["personal-care"],
  "Dettol": ["personal-care"],
  "Nu Formula": ["personal-care"],
  "La Roche Posay": ["personal-care"],
  "Vichy": ["personal-care"],
  "Puricas": ["personal-care"],
  "Nuetrogena": ["personal-care"],
  "Caring": ["personal-care"],
  "Citra": ["personal-care"],
  "Pocare": ["personal-care"],
  "QRuss": ["personal-care"],
  "โป๊ยเซียน": ["personal-care"],
  "ดอกบัวคู่": ["personal-care"],
  "ตรางู": ["personal-care"],
  "ไลฟ์รี่": ["personal-care"],
  "Sentel": ["personal-care"],
  "Merci": ["personal-care"],

  // Baby & Mom
  "Mamypoko": ["personal-care"],
  "BabyLove": ["personal-care"],
  "Mama's Choices": ["personal-care"],
  "Lanos": ["personal-care"],

  // Multi-category
  "Unilever": ["personal-care", "food"],
};

export function getBrandCategories(brand: string): ContentCategoryId[] {
  return BRAND_CONTENT_MAP[brand] ?? [];
}

export function getMCContentCategories(brands: string[]): ContentCategoryId[] {
  const cats = new Set<ContentCategoryId>();
  brands.forEach((b) => {
    const mapped = BRAND_CONTENT_MAP[b];
    if (mapped) mapped.forEach((c) => cats.add(c));
  });
  return [...cats];
}

export function getBrandsInCategory(categoryId: ContentCategoryId): string[] {
  return Object.entries(BRAND_CONTENT_MAP)
    .filter(([, cats]) => cats.includes(categoryId))
    .map(([brand]) => brand);
}
