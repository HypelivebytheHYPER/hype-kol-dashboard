"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { CONTENT_CATEGORIES, getBrandCategories, type ContentCategoryId } from "@/lib/taxonomy";
import { mcHue, oklch, canvasColors } from "@/lib/design-tokens";
import type { LiveMC } from "@/lib/types/catalog";

interface WireMapProps {
  mcs: LiveMC[];
  selectedCategory?: ContentCategoryId | null;
}

interface Node {
  id: string;
  label: string;
  type: "mc" | "category" | "brand";
  x: number;
  y: number;
  color: string;
  radius: number;
}

interface Edge {
  from: string;
  to: string;
}

// ── Layout constants ─────────────────────────────────────────────

const LAYOUT = {
  col: { mc: 0.15, cat: 0.48, brand: 0.82 },
  radius: { mc: 16, cat: 22, brand: 4 },
  gap: { mc: 12, cat: 50, brand: 26 },
  header: 30,
  padY: 20,
  minHeight: 400,
  maxHeight: 1200,
} as const;

export function WireMap({ mcs, selectedCategory }: WireMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [isDark, setIsDark] = useState(false);

  // Detect color scheme for canvas rendering
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Also watch for .dark class on html (manual toggle)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Build three-tier graph: MC → Category → Brand
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];

    const activeCatIds = new Set<ContentCategoryId>();
    const activeBrands = new Map<string, { categories: ContentCategoryId[]; count: number }>();

    mcs.forEach((mc) => {
      mc.contentCategories.forEach((c) => activeCatIds.add(c as ContentCategoryId));
      mc.brands.forEach((b) => {
        const cats = getBrandCategories(b);
        const existing = activeBrands.get(b);
        if (existing) {
          existing.count++;
        } else {
          activeBrands.set(b, { categories: cats, count: 1 });
        }
      });
    });

    const activeCats = CONTENT_CATEGORIES.filter((c) => activeCatIds.has(c.id));
    const brandList = [...activeBrands.entries()].sort((a, b) => b[1].count - a[1].count);

    // Compute canvas height from the tallest column
    const mcCircumferenceNeeded = mcs.length * (LAYOUT.radius.mc * 2 + LAYOUT.gap.mc);
    const mcCircleRadius = Math.max(100, mcCircumferenceNeeded / (2 * Math.PI));
    const mcColumnNeed = mcCircleRadius * 2 + LAYOUT.radius.mc * 2 + LAYOUT.header + LAYOUT.padY;

    const catColumnNeed = activeCats.length * LAYOUT.gap.cat + LAYOUT.header + LAYOUT.padY;
    const brandColumnNeed = brandList.length * LAYOUT.gap.brand + LAYOUT.header + LAYOUT.padY;

    const needHeight = Math.max(mcColumnNeed, catColumnNeed, brandColumnNeed);
    const height = Math.max(LAYOUT.minHeight, Math.min(LAYOUT.maxHeight, needHeight));
    const centerY = (height + LAYOUT.header) / 2;

    // ── MC nodes (left column, circle layout) ────────────────────
    const mcCenterX = dimensions.width * LAYOUT.col.mc;

    mcs.forEach((mc, i) => {
      const angle = (i / mcs.length) * Math.PI * 2 - Math.PI / 2;
      const hue = mcHue(mc.handle);
      nodeMap.set(mc.id, {
        id: mc.id,
        label: mc.handle,
        type: "mc",
        x: mcCenterX + Math.cos(angle) * mcCircleRadius,
        y: centerY + Math.sin(angle) * mcCircleRadius,
        color: oklch(null, 0.60, hue, 0.14),
        radius: LAYOUT.radius.mc,
      });
    });

    // ── Category nodes (center column) ───────────────────────────
    const catX = dimensions.width * LAYOUT.col.cat;
    const catSpan = (activeCats.length - 1) * LAYOUT.gap.cat;
    const catStartY = centerY - catSpan / 2;

    activeCats.forEach((cat, i) => {
      nodeMap.set(`cat:${cat.id}`, {
        id: `cat:${cat.id}`,
        label: cat.label,
        type: "category",
        x: catX,
        y: catStartY + i * LAYOUT.gap.cat,
        color: oklch(cat.id, 0.62),
        radius: LAYOUT.radius.cat,
      });
    });

    // ── Brand nodes (right column) ───────────────────────────────
    const brandX = dimensions.width * LAYOUT.col.brand;
    const brandSpan = (brandList.length - 1) * LAYOUT.gap.brand;
    const brandStartY = centerY - brandSpan / 2;

    brandList.forEach(([brand], i) => {
      nodeMap.set(`brand:${brand}`, {
        id: `brand:${brand}`,
        label: brand,
        type: "brand",
        x: brandX,
        y: brandStartY + i * LAYOUT.gap.brand,
        color: oklch(null, 0.55),
        radius: LAYOUT.radius.brand,
      });
    });

    // ── Edges: MC → Category ─────────────────────────────────────
    mcs.forEach((mc) => {
      mc.contentCategories.forEach((catId) => {
        if (nodeMap.has(`cat:${catId}`)) {
          edgeList.push({ from: mc.id, to: `cat:${catId}` });
        }
      });
    });

    // ── Edges: Category → Brand ──────────────────────────────────
    brandList.forEach(([brand, { categories }]) => {
      categories.forEach((catId) => {
        if (nodeMap.has(`cat:${catId}`)) {
          edgeList.push({ from: `cat:${catId}`, to: `brand:${brand}` });
        }
      });
    });

    return { nodes: [...nodeMap.values()], edges: edgeList };
  }, [mcs, dimensions]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions((prev) => ({ ...prev, width }));
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Sync computed height into dimensions
  useEffect(() => {
    if (nodes.length === 0) return;
    const maxY = Math.max(...nodes.map((n) => n.y + n.radius));
    const needHeight = Math.max(LAYOUT.minHeight, Math.min(LAYOUT.maxHeight, maxY + LAYOUT.padY));
    setDimensions((prev) =>
      prev.height !== needHeight ? { ...prev, height: needHeight } : prev
    );
  }, [nodes]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const theme = canvasColors();

    const isConnected2Hop = (nodeId: string): boolean => {
      if (!hoveredNode && !selectedCategory) return true;
      const focus = hoveredNode || (selectedCategory ? `cat:${selectedCategory}` : null);
      if (!focus) return true;
      if (nodeId === focus) return true;
      if (edges.some((e) => (e.from === focus && e.to === nodeId) || (e.to === focus && e.from === nodeId))) return true;
      const intermediates = edges
        .filter((e) => e.from === focus || e.to === focus)
        .map((e) => (e.from === focus ? e.to : e.from));
      return intermediates.some((mid) =>
        edges.some((e) => (e.from === mid && e.to === nodeId) || (e.to === mid && e.from === nodeId))
      );
    };

    const isEdgeHighlighted = (edge: Edge): boolean => {
      const focus = hoveredNode || (selectedCategory ? `cat:${selectedCategory}` : null);
      if (!focus) return false;
      return (
        edge.from === focus ||
        edge.to === focus ||
        edges
          .filter((e) => e.from === focus || e.to === focus)
          .some((e) => {
            const mid = e.from === focus ? e.to : e.from;
            return edge.from === mid || edge.to === mid;
          })
      );
    };

    const hasFocus = !!hoveredNode || !!selectedCategory;

    // Draw edges
    edges.forEach((edge) => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return;

      const highlighted = isEdgeHighlighted(edge);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      const cpX = (from.x + to.x) / 2;
      ctx.bezierCurveTo(cpX, from.y, cpX, to.y, to.x, to.y);
      ctx.strokeStyle = highlighted ? theme.edgeHighlight : theme.edgeDefault;
      ctx.lineWidth = highlighted ? 1.5 : 0.5;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const connected = isConnected2Hop(node.id);
      const dimmed = hasFocus && !connected;

      ctx.globalAlpha = dimmed ? 0.15 : 1;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (node.id === hoveredNode) {
        ctx.strokeStyle = theme.nodeStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label
      const fontSize = node.type === "category" ? 11 : node.type === "mc" ? 10 : 9;
      const fontWeight = node.type === "category" || node.id === hoveredNode ? "bold " : "";
      ctx.font = `${fontWeight}${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = dimmed
        ? theme.textDimmed
        : node.type === "brand"
          ? theme.textMuted
          : theme.textPrimary;

      if (node.type === "brand") {
        ctx.textAlign = "left";
        ctx.fillText(node.label, node.x + node.radius + 6, node.y + 3);
      } else if (node.type === "category") {
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + node.radius + 16);
      } else {
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);
      }

      ctx.globalAlpha = 1;
    });

    // Column headers
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.fillStyle = theme.textMuted;
    ctx.textAlign = "center";
    ctx.fillText("MCs", dimensions.width * LAYOUT.col.mc, 20);
    ctx.fillText("Categories", dimensions.width * LAYOUT.col.cat, 20);
    ctx.fillText("Brands", dimensions.width * LAYOUT.col.brand, 20);
  }, [nodes, edges, hoveredNode, selectedCategory, dimensions, isDark]);

  // Mouse hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found: string | null = null;
    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const hitRadius = node.radius + 8;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
  };

  return (
    <div ref={containerRef} className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">MC → Category → Brand</p>
          <p className="text-xs text-muted-foreground">
            {mcs.length} MCs · {new Set(mcs.flatMap((mc) => mc.contentCategories)).size} Categories · {new Set(mcs.flatMap((mc) => mc.brands)).size} Brands
          </p>
        </div>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full inline-block" style={{ backgroundColor: oklch("cosmetics", 0.60) }} /> MC
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full inline-block" style={{ backgroundColor: oklch("health", 0.62) }} /> Category
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full inline-block bg-muted-foreground" /> Brand
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
    </div>
  );
}
