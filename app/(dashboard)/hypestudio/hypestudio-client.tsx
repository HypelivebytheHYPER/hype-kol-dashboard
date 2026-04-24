"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Studio } from "@/lib/types/catalog";
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  MapPin,
  Users,
  Clock,
  Banknote,
  Camera,
  Clapperboard,
  Sparkles,
  MonitorPlay,
  Palette,
  TrendingUp,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const R2 = "https://pub-6b552d9c3c0f4ef0ba8e32adfb058578.r2.dev";

/* ── Utility: Intersection Observer for scroll animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ── Utility: Image reorder for gallery lead ── */
function reorderImages(studio: Studio): string[] {
  const count = studio.images.length;
  if (count === 0) return [];
  const leadIndex = count >= 20 ? 3 : count >= 9 ? 2 : count >= 5 ? 1 : 0;
  const safeLead = Math.min(leadIndex, count - 1);
  return [
    ...studio.images.slice(safeLead),
    ...studio.images.slice(0, safeLead),
  ];
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",
        inView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */
const HERO_IMAGES = [
  `${R2}/Hypestudio01.jpg`,
  `${R2}/Hypestudio02.jpg`,
  `${R2}/Hypestudio03.jpg`,
];

function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % HERO_IMAGES.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[100dvh] flex flex-col justify-end overflow-hidden">
      {/* Ken Burns crossfade background */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute inset-0 transition-opacity duration-[2000ms] ease-in-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={src}
              alt={`HypeStudio ${i + 1}`}
              fill
              className={cn(
                "object-cover transition-transform duration-[8000ms] ease-out",
                i === index ? "scale-110" : "scale-100"
              )}
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-20 md:pb-28">
        <Reveal>
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-studio-accent" />
            <span className="text-xs uppercase tracking-[0.3em] text-foreground/60 font-medium">
              Creative Production Studio · Bangkok
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black tracking-[-0.05em] leading-[0.82] mb-8">
            <span className="block text-foreground">HYPE</span>
            <span className="block text-studio-accent">STUDIO</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="max-w-md text-lg md:text-xl text-foreground/60 leading-relaxed mb-10 font-light">
            Full-service content production.
            <br />
            From studio floor to For You Page.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="studio"
              size="lg"
              className="rounded-full gap-2 px-7"
              onClick={() =>
                document
                  .getElementById("studios")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Browse Studios
              <ArrowRight className="size-4" />
            </Button>
            <Link href={ROUTES.KOLS}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full gap-2 border-foreground/15 text-foreground hover:bg-foreground/10 hover:text-foreground bg-transparent/50 backdrop-blur-sm"
              >
                Browse Creators
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Scroll indicator */}
        <Reveal delay={500}>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/30">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-foreground/30 to-transparent animate-pulse" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EDITORIAL IMAGE STRIP
   ═══════════════════════════════════════════════════════════════ */
function EditorialStrip() {
  const images = [
    { src: `${R2}/Hypestudio01.jpg`, span: "md:col-span-2 md:row-span-2" },
    { src: `${R2}/Hypestudio02.jpg`, span: "md:col-span-1 md:row-span-1" },
    { src: `${R2}/Hypestudio03.jpg`, span: "md:col-span-1 md:row-span-1" },
  ];

  return (
    <section className="px-6 md:px-12 lg:px-20 py-4">
      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-3 md:gap-4 max-h-[70vh]">
          {images.map((img, i) => (
            <div
              key={img.src}
              className={cn(
                "relative overflow-hidden rounded-2xl group",
                img.span
              )}
            >
              <Image
                src={img.src}
                alt={`Studio ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAPABILITIES
   ═══════════════════════════════════════════════════════════════ */
const CAPABILITIES = [
  {
    icon: Camera,
    title: "Studio Rental",
    desc: "Fully equipped sound stages with professional lighting, backdrops, and gear included.",
  },
  {
    icon: MonitorPlay,
    title: "Live Commerce",
    desc: "Multi-camera livestream setups optimized for TikTok Shop and Shopee Live selling.",
  },
  {
    icon: Clapperboard,
    title: "Content Production",
    desc: "End-to-end short-form video production from concept to final cut.",
  },
  {
    icon: Sparkles,
    title: "Creator Matching",
    desc: "Access our curated network of TikTok creators matched to your brand and audience.",
  },
  {
    icon: Palette,
    title: "Brand Creative",
    desc: "Custom set design, art direction, and visual identity for campaign shoots.",
  },
  {
    icon: TrendingUp,
    title: "Performance",
    desc: "Real-time analytics and post-campaign reporting to measure content ROI.",
  },
];

function Capabilities() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 md:mb-24">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium mb-4">
              What We Do
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9]">
              Built for
              <br />
              <span className="text-studio-accent">TikTok-native</span>
              <br />
              production
            </h2>
          </Reveal>
          <Reveal delay={150} className="flex items-end">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
              Everything you need to shoot, stream, and scale creator-led
              content — all under one roof.
            </p>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 rounded-3xl overflow-hidden">
          {CAPABILITIES.map((cap, i) => (
            <Reveal key={cap.title} delay={i * 80}>
              <div className="bg-background p-8 md:p-10 h-full group hover:bg-muted/30 transition-colors duration-500">
                <div className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-studio-accent/10 text-studio-accent border border-studio-accent/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <cap.icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">
                  {cap.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATS
   ═══════════════════════════════════════════════════════════════ */
function Stats({ studios }: { studios: Studio[] }) {
  const totalStudios = studios.length;
  const totalCapacity = studios.reduce(
    (sum, s) => sum + (s.capacity || 0),
    0
  );
  const avgPrice = totalStudios
    ? Math.round(
        studios.reduce((sum, s) => sum + (s.startingPrice || 0), 0) /
          totalStudios
      )
    : 0;

  const stats = [
    { value: totalStudios.toString(), label: "Partner Studios" },
    { value: `${totalCapacity}+`, label: "Total Capacity" },
    { value: `฿${avgPrice.toLocaleString()}`, label: "Avg. Rate / Day" },
    { value: "Bangkok", label: "Location" },
  ];

  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-y border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div className="text-center md:text-left">
                <div className="text-4xl md:text-5xl font-black tracking-tight text-studio-accent mb-2">
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUDIO CARDS
   ═══════════════════════════════════════════════════════════════ */
function StudioCard({ studio, featured = false }: { studio: Studio; featured?: boolean }) {
  const images = reorderImages(studio);
  const photoCount = images.length;

  return (
    <Card
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-card/30 transition-all duration-500 hover:shadow-xl hover:border-studio-accent/25 group",
        featured
          ? "w-full md:w-[520px] lg:w-[600px]"
          : "w-[280px] sm:w-[320px] md:w-[360px]"
      )}
    >
      {/* Photo Slider */}
      {photoCount > 0 && (
        <div className="relative">
          <div
            className={cn(
              "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide",
              featured ? "aspect-[4/5]" : "aspect-[4/5]"
            )}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-full aspect-[4/5] relative"
              >
                <Image
                  src={src}
                  alt={`${studio.name} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes={featured ? "600px" : "360px"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm text-[10px] font-medium text-foreground/90">
            {photoCount} photos
          </div>
          {studio.recommended && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-studio-accent/90 text-studio-accent-foreground backdrop-blur-sm text-xs font-semibold flex items-center gap-1">
              <Star className="size-3 fill-current" />
              Recommended
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold tracking-tight leading-snug truncate">
            {studio.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {studio.provider}
          </p>
        </div>

        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
            Starting Price
          </div>
          <div className="text-3xl font-black tracking-tight text-studio-accent">
            ฿{studio.startingPrice.toLocaleString()}
            <span className="text-sm font-medium text-muted-foreground ml-1.5">
              / day
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{studio.size}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-3.5 shrink-0" />
            <span>{studio.capacity} people</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span className="truncate">{studio.hours}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Banknote className="size-3.5 shrink-0" />
            <span>Deposit ฿{studio.deposit.toLocaleString()}</span>
          </div>
        </div>

        {studio.reference && (
          <Button
            variant="studio-outline"
            className="w-full rounded-full gap-2"
            onClick={() => window.open(studio.reference, "_blank")}
          >
            View Photos
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

function StudiosSection({ studios }: { studios: Studio[] }) {
  const [featured, ...rest] = studios;

  return (
    <section id="studios" className="py-20 md:py-32">
      {/* Section Header */}
      <div className="px-6 md:px-12 lg:px-20 mb-12 md:mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <Reveal>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium mb-4">
                Partner Studios
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                All Studios
              </h2>
            </Reveal>
            {featured && (
              <Reveal delay={150}>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{studios.length}</span>{" "}
                  studios available in Bangkok
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>

      {/* Featured Studio */}
      {featured && (
        <div className="px-6 md:px-12 lg:px-20 mb-8">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4 px-1">
                Featured
              </div>
            </Reveal>
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4">
              <StudioCard studio={featured} featured />
            </div>
          </div>
        </div>
      )}

      {/* All Studios Carousel */}
      <div className="pl-6 md:pl-12 lg:pl-20">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4 px-1">
              {rest.length > 0 ? `More Studios (${rest.length})` : ""}
            </div>
          </Reveal>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 pr-6">
          {rest.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHOWREEL
   ═══════════════════════════════════════════════════════════════ */
const SHOWREEL_VIDEOS = [
  {
    src: `${R2}/%E0%B8%AB%E0%B8%AD%E0%B8%A1%E0%B8%97%E0%B8%A3%E0%B8%B1%E0%B8%9F%E0%B9%80%E0%B8%9F%E0%B8%B4%E0%B8%A5%E0%B8%82%E0%B8%99%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%B5%E0%B9%89%20%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A5%E0%B8%AD%E0%B8%87%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%87%E0%B9%84%E0%B8%AB%E0%B8%A7.mp4`,
    title: "Truffle",
    subtitle: "Product Showcase",
  },
  {
    src: `${R2}/hypelive%20x%20Brand%20Decode02.mp4`,
    title: "Brand Decode",
    subtitle: "Live Commerce",
  },
];

function VideoCard({
  src,
  title,
  subtitle,
}: {
  src: string;
  title: string;
  subtitle: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () =>
      setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  return (
    <Card className="relative overflow-hidden bg-background group border-0 ring-0 rounded-2xl shrink-0 w-full md:w-[400px] lg:w-[460px]">
      <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
        <video
          ref={videoRef}
          src={src}
          muted={muted}
          playsInline
          loop
          className="absolute inset-0 w-full h-full object-cover"
          onClick={toggle}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <Button
              variant="ghost"
              size="icon"
              aria-label={playing ? "Pause video" : "Play video"}
              onClick={toggle}
              className="size-16 rounded-full bg-foreground/90 text-background hover:bg-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm"
            >
              <Play className="size-7 ml-0.5" fill="currentColor" aria-hidden="true" />
            </Button>
          </div>
        )}
        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-background/60 to-transparent">
          <div className="text-xs uppercase tracking-widest text-foreground/50 font-medium mb-1">
            {subtitle}
          </div>
          <div className="text-lg font-bold text-foreground">{title}</div>
        </div>
      </div>
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
            className="size-8 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
          >
            {playing ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const v = videoRef.current;
              if (v) {
                v.muted = !muted;
                setMuted(!muted);
              }
            }}
            className="size-8 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
          >
            {muted ? (
              <VolumeX className="size-4" aria-hidden="true" />
            ) : (
              <Volume2 className="size-4" aria-hidden="true" />
            )}
          </Button>
          <div className="flex-1 h-1 bg-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-studio-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Fullscreen"
            onClick={() => videoRef.current?.requestFullscreen()}
            className="size-8 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Showreel() {
  return (
    <section id="showreel" className="py-20 md:py-32 bg-muted/20">
      <div className="px-6 md:px-12 lg:px-20 mb-12 md:mb-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium mb-4">
              Showreel
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
              Recent Work
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-sm text-muted-foreground max-w-xs">
              Selected projects from our studio productions and live commerce
              campaigns.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="pl-6 md:pl-12 lg:pl-20">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-5 pb-4 pr-6">
          {SHOWREEL_VIDEOS.map((video) => (
            <VideoCard key={video.title} {...video} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT CTA
   ═══════════════════════════════════════════════════════════════ */
function ContactCTA() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-24 md:py-40">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/50 via-background to-muted/30 border border-border/40 p-10 md:p-16 lg:p-20">
            <div className="absolute top-0 right-0 size-64 bg-studio-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 size-48 bg-studio-accent/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                  Ready to <span className="text-studio-accent">create</span>?
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Book a studio, match with creators, or just say hi. We reply
                  within 24 hours.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="studio"
                  size="lg"
                  className="rounded-full gap-2 px-7"
                  onClick={() =>
                    (window.location.href = "mailto:marketing@hypelive.io")
                  }
                >
                  Get in Touch
                  <ArrowRight className="size-4" />
                </Button>
                <Link href={ROUTES.KOLS}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full gap-2"
                  >
                    Browse Creators
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export function HypeStudioClient({ studios }: { studios: Studio[] }) {
  return (
    <div className="relative -mx-4 -my-6 md:-mx-6 md:-my-6">
      <Hero />
      <EditorialStrip />
      <Capabilities />
      <Stats studios={studios} />
      <StudiosSection studios={studios} />
      <Showreel />
      <ContactCTA />
    </div>
  );
}
