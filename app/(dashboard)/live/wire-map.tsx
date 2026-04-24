"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
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
  radius: number;
  /** Category ID for theme-aware color lookup at draw time */
  catId?: ContentCategoryId;
  /** Hue for MC nodes (deterministic from handle) */
  hue?: number;
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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isHoveringNode, setIsHoveringNode] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [isDark, setIsDark] = useState(false);

  // Refs for hover state to avoid React re-renders on every mousemove pixel
  const hoveredNodeRef = useRef<string | null>(null);
  const isHoveringNodeRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Clear node selection when category filter changes
  useEffect(() => {
    setSelectedNode(null);
  }, [selectedCategory]);

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
      nodeMap.set(mc.id, {
        id: mc.id,
        label: mc.handle,
        type: "mc",
        x: mcCenterX + Math.cos(angle) * mcCircleRadius,
        y: centerY + Math.sin(angle) * mcCircleRadius,
        radius: LAYOUT.radius.mc,
        hue: mcHue(mc.handle),
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
        radius: LAYOUT.radius.cat,
        catId: cat.id,
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

  // Hit-test a canvas coordinate against all nodes
  const hitTest = (clientX: number, clientY: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const hitRadius = node.radius + 8;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        return node.id;
      }
    }
    return null;
  };

  // Imperative redraw using refs — avoids React re-renders on every mousemove
  const drawCanvas = () => {
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
    const hoverId = hoveredNodeRef.current;
    const selectId = selectedNode;

    const getNodeColor = (node: Node): string => {
      if (node.type === "mc" && node.hue != null) {
        return oklch(null, 0.60, node.hue, 0.14);
      }
      if (node.type === "category" && node.catId) {
        return oklch(node.catId, 0.62);
      }
      return oklch(null, 0.55);
    };

    const focus = hoverId ?? selectId ?? (selectedCategory ? `cat:${selectedCategory}` : null);
    const hasFocus = !!focus;

    const isConnected2Hop = (nodeId: string): boolean => {
      if (!hasFocus) return true;
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
      if (!hasFocus) return false;
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
      ctx.fillStyle = getNodeColor(node);
      ctx.fill();

      if (node.id === hoverId) {
        ctx.strokeStyle = theme.nodeStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (node.id === selectId) {
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = theme.nodeStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label
      const fontSize = node.type === "category" ? 11 : node.type === "mc" ? 10 : 9;
      const fontWeight = node.type === "category" || node.id === hoverId || node.id === selectId ? "bold " : "";
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
  };

  // Redraw when dependencies change (but NOT on every hover — hover uses refs + rAF)
  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, selectedNode, selectedCategory, dimensions, isDark]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = hitTest(e.clientX, e.clientY);
    const changed = hit !== hoveredNodeRef.current;
    hoveredNodeRef.current = hit;
    isHoveringNodeRef.current = !!hit;

    if (changed) {
      setIsHoveringNode(!!hit);
      // Imperative redraw for hover visuals without waiting for React re-render
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawCanvas);
    }
  };

  const handleMouseLeave = () => {
    if (hoveredNodeRef.current !== null) {
      hoveredNodeRef.current = null;
      isHoveringNodeRef.current = false;
      setIsHoveringNode(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawCanvas);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = hitTest(e.clientX, e.clientY);
    setSelectedNode((prev) => (prev === hit ? null : hit));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (nodes.length === 0) return;
    const currentId = selectedNode ?? hoveredNodeRef.current;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (currentId) {
        setSelectedNode((prev) => (prev === currentId ? null : currentId));
      } else {
        setSelectedNode(nodes[0].id);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setSelectedNode(null);
      return;
    }

    let targetIndex = -1;
    if (currentId) {
      targetIndex = nodes.findIndex((n) => n.id === currentId);
    }

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = targetIndex >= 0 ? (targetIndex + 1) % nodes.length : 0;
      const nextId = nodes[nextIndex].id;
      setSelectedNode(nextId);
      hoveredNodeRef.current = nextId;
      isHoveringNodeRef.current = true;
      setIsHoveringNode(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawCanvas);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = targetIndex >= 0 ? (targetIndex - 1 + nodes.length) % nodes.length : nodes.length - 1;
      const nextId = nodes[nextIndex].id;
      setSelectedNode(nextId);
      hoveredNodeRef.current = nextId;
      isHoveringNodeRef.current = true;
      setIsHoveringNode(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawCanvas);
    }
  };

  const focusDescription = useMemo(() => {
    const mcCount = mcs.length;
    const catCount = new Set(mcs.flatMap((mc) => mc.contentCategories)).size;
    const brandCount = new Set(mcs.flatMap((mc) => mc.brands)).size;
    return `Network graph showing ${mcCount} MCs connected to ${catCount} categories and ${brandCount} brands. Use arrow keys to navigate nodes, Enter or Space to select, Escape to clear.`;
  }, [mcs]);

  return (
    <div ref={containerRef} className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">MC → Category → Brand</p>
          <p className="text-xs text-muted-foreground">
            {mcs.length} MCs · {new Set(mcs.flatMap((mc) => mc.contentCategories)).size} Categories · {new Set(mcs.flatMap((mc) => mc.brands)).size} Brands
          </p>
        </div>
        <div className="flex gap-3 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full inline-block bg-gradient-to-br from-chart-3 to-chart-4" /> MC
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full inline-block bg-chart-2" /> Category
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full inline-block bg-muted-foreground" /> Brand
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={focusDescription}
        tabIndex={0}
        style={{ width: dimensions.width, height: dimensions.height }}
        className={cn(
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isHoveringNode ? "cursor-pointer" : "cursor-crosshair"
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
