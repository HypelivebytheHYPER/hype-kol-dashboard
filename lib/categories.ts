// Standardized creator categories — single source of truth
// All Lark Base tables use "Inferred Categories" (MultiSelect)

export const CATEGORY_FIELD = "Inferred Categories";

export const CATEGORIES = [
  { id: "skincare", label: "Skincare", color: "from-pink-500 to-rose-500" },
  { id: "beauty", label: "Beauty", color: "from-pink-400 to-fuchsia-500" },
  { id: "makeup", label: "Makeup", color: "from-rose-400 to-pink-500" },
  { id: "fashion", label: "Fashion", color: "from-purple-500 to-violet-500" },
  { id: "food", label: "Food", color: "from-orange-500 to-amber-500" },
  { id: "gadgets", label: "Gadgets", color: "from-blue-500 to-cyan-500" },
  { id: "tech", label: "Tech", color: "from-indigo-500 to-blue-500" },
  { id: "mom", label: "Mom & Parenting", color: "from-pink-300 to-rose-400" },
  { id: "fmcg", label: "FMCG", color: "from-yellow-500 to-orange-500" },
  { id: "home", label: "Home", color: "from-green-500 to-emerald-500" },
  { id: "health", label: "Health", color: "from-teal-500 to-cyan-500" },
  { id: "fitness", label: "Fitness", color: "from-red-500 to-orange-500" },
  { id: "lifestyle", label: "Lifestyle", color: "from-green-400 to-teal-500" },
  { id: "pet", label: "Pet", color: "from-amber-400 to-yellow-500" },
  { id: "seafood", label: "Seafood", color: "from-cyan-500 to-blue-500" },
  { id: "shopping", label: "Shopping", color: "from-violet-500 to-purple-500" },
  { id: "retail", label: "Retail", color: "from-slate-500 to-zinc-600" },
  { id: "local", label: "Local", color: "from-emerald-500 to-green-600" },
  { id: "sports", label: "Sports", color: "from-red-500 to-rose-500" },
  { id: "clothing", label: "Clothing", color: "from-purple-400 to-indigo-500" },
  { id: "accessories", label: "Accessories", color: "from-amber-500 to-orange-500" },
  { id: "doctor", label: "Doctor", color: "from-teal-500 to-emerald-500" },
  { id: "healthy", label: "Healthy", color: "from-green-500 to-lime-500" },
  { id: "wellness", label: "Wellness", color: "from-cyan-400 to-teal-500" },
  { id: "automation", label: "Automation", color: "from-indigo-500 to-violet-500" },
  { id: "data-engineering", label: "Data Engineering", color: "from-blue-600 to-indigo-600" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// Case-insensitive raw value → standardized ID
const ALIASES: Record<string, CategoryId> = Object.fromEntries([
  ...CATEGORIES.map((c) => [c.id, c.id]),
  ...CATEGORIES.map((c) => [c.label.toLowerCase(), c.id]),
  ["data engineering", "data-engineering"],
  ["mom & parenting", "mom"],
]);

export function normalizeCategory(raw: string): CategoryId | null {
  return ALIASES[raw.toLowerCase().trim()] ?? null;
}

export function normalizeCategories(raw: string[]): CategoryId[] {
  return raw.map(normalizeCategory).filter((c): c is CategoryId => c !== null);
}

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getCategoryColor(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.color ?? "from-gray-500 to-gray-600";
}
