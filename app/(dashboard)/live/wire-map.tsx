"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { CONTENT_CATEGORIES, getBrandCategories, type ContentCategoryId } from "@/lib/taxonomy";
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

const MC_COLORS = [
  "#f472b6", "#a78bfa", "#60a5fa", "#34d399",
  "#fbbf24", "#fb923c", "#f87171", "#2dd4bf",
  "#818cf8", "#e879f9",
];

export function WireMap({ mcs, selectedCategory }: WireMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  // Build three-tier graph: MC → Category → Brand
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];

    // Collect which categories + brands are in the data
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

    // --- MC nodes (left column, circle layout) ---
    const mcCenterX = dimensions.width * 0.15;
    const mcCenterY = dimensions.height / 2;
    const mcRadius = Math.min(dimensions.height * 0.35, 180);

    mcs.forEach((mc, i) => {
      const angle = (i / mcs.length) * Math.PI * 2 - Math.PI / 2;
      nodeMap.set(mc.id, {
        id: mc.id,
        label: mc.handle,
        type: "mc",
        x: mcCenterX + Math.cos(angle) * mcRadius,
        y: mcCenterY + Math.sin(angle) * mcRadius,
        color: MC_COLORS[i % MC_COLORS.length],
        radius: 16,
      });
    });

    // --- Category nodes (center column) ---
    const catX = dimensions.width * 0.48;
    const catSpacing = Math.min(dimensions.height / (activeCats.length + 1), 80);
    const catStartY = mcCenterY - ((activeCats.length - 1) * catSpacing) / 2;

    activeCats.forEach((cat, i) => {
      nodeMap.set(`cat:${cat.id}`, {
        id: `cat:${cat.id}`,
        label: cat.label,
        type: "category",
        x: catX,
        y: catStartY + i * catSpacing,
        color: cat.color,
        radius: 22,
      });
    });

    // --- Brand nodes (right column) ---
    const brandX = dimensions.width * 0.82;
    const brandList = [...activeBrands.entries()].sort((a, b) => b[1].count - a[1].count);
    const brandSpacing = Math.min(dimensions.height / (brandList.length + 1), 28);
    const brandStartY = mcCenterY - ((brandList.length - 1) * brandSpacing) / 2;

    brandList.forEach(([brand], i) => {
      nodeMap.set(`brand:${brand}`, {
        id: `brand:${brand}`,
        label: brand,
        type: "brand",
        x: brandX,
        y: brandStartY + i * brandSpacing,
        color: "#64748b",
        radius: 4,
      });
    });

    // --- Edges: MC → Category ---
    mcs.forEach((mc) => {
      mc.contentCategories.forEach((catId) => {
        if (nodeMap.has(`cat:${catId}`)) {
          edgeList.push({ from: mc.id, to: `cat:${catId}` });
        }
      });
    });

    // --- Edges: Category → Brand ---
    brandList.forEach(([brand, { categories }]) => {
      categories.forEach((catId) => {
        if (nodeMap.has(`cat:${catId}`)) {
          edgeList.push({ from: `cat:${catId}`, to: `brand:${brand}` });
        }
      });
    });

    return { nodes: [...nodeMap.values()], edges: edgeList };
  }, [mcs, dimensions]);

  // Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(450, Math.min(700, mcs.length * 55)) });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [mcs.length]);

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

    // Two-hop connectivity for hover (MC → its categories → their brands)
    const isConnected2Hop = (nodeId: string): boolean => {
      if (!hoveredNode && !selectedCategory) return true;
      const focus = hoveredNode || (selectedCategory ? `cat:${selectedCategory}` : null);
      if (!focus) return true;
      if (nodeId === focus) return true;
      // Direct connection
      if (edges.some((e) => (e.from === focus && e.to === nodeId) || (e.to === focus && e.from === nodeId))) return true;
      // Two-hop: find intermediate nodes
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
      ctx.strokeStyle = highlighted ? "rgba(96, 165, 250, 0.6)" : "rgba(100, 116, 139, 0.12)";
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
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label
      const fontSize = node.type === "category" ? 11 : node.type === "mc" ? 10 : 9;
      const fontWeight = node.type === "category" || node.id === hoveredNode ? "bold " : "";
      ctx.font = `${fontWeight}${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = dimmed ? "rgba(148, 163, 184, 0.2)" : node.type === "brand" ? "#94a3b8" : "#e2e8f0";

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
    ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("MCs", dimensions.width * 0.15, 20);
    ctx.fillText("Categories", dimensions.width * 0.48, 20);
    ctx.fillText("Brands", dimensions.width * 0.82, 20);
  }, [nodes, edges, hoveredNode, selectedCategory, dimensions]);

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
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" /> MC
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Category
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Brand
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
