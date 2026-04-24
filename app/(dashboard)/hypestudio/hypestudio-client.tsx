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
  MonitorPlay,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import {
  STUDIO,
  GRADIENT,
  DURATION,
  SECTION,
  HEADING,
  LABEL,
  OVERLAY,
  TEXT_OPACITY,
  BORDER_OPACITY,
  FG_OPACITY,
} from "@/lib/design-tokens";

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        `transition-all ${DURATION.slowest} ease-out`,
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
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
    const tick = () => setIndex((i) => (i + 1) % HERO_IMAGES.length);
    const id = setInterval(tick, 6000);
    const onVis = () => {
      if (document.hidden) clearInterval(id);
      else setInterval(tick, 6000);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <section className="relative h-[100dvh] flex flex-col justify-end overflow-hidden">
      {/* Ken Burns crossfade background */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute inset-0 transition-opacity ease-in-out",
              DURATION.heroFade,
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              aria-hidden="true"
              className={cn(
                "object-cover transition-transform ease-out",
                DURATION.heroZoom,
                i === index ? "scale-110" : "scale-100"
              )}
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
        <div className={cn("absolute inset-0", OVERLAY.medium)} />
        <div className={cn("absolute inset-0", GRADIENT.heroOverlay)} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-20 md:pb-28">
        <Reveal>
          <div className="flex items-center gap-2 mb-6">
            <span className={cn("inline-block w-2 h-2 rounded-full animate-pulse", STUDIO.bg)} />
            <span className={LABEL.micro}>
              Creative Production Studio · Bangkok
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className={cn(HEADING.hero, "mb-8")}>
            <span className="block text-foreground">HYPE</span>
            <span className={cn("block", STUDIO.text)}>STUDIO</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className={cn("max-w-md text-lg md:text-xl leading-relaxed mb-10 font-light", TEXT_OPACITY.muted)}>
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
                className={cn("rounded-full gap-2 text-foreground hover:text-foreground backdrop-blur-sm border-foreground/15", FG_OPACITY.subtle)}
              >
                Browse Creators
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
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
];

function Capabilities() {
  return (
    <section className={cn(SECTION.paddingX, SECTION.py)}>
      <div className={SECTION.container}>
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 md:mb-24">
          <Reveal>
            <div className={cn(LABEL.micro, "mb-4")}>What We Do</div>
            <h2 className={HEADING.sectionLg}>
              Built for
              <br />
              <span className={STUDIO.text}>TikTok-native</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/30 rounded-3xl overflow-hidden">
          {CAPABILITIES.map((cap, i) => (
            <Reveal key={cap.title} delay={i * 80}>
              <div className="bg-background p-8 md:p-10 h-full group hover:bg-muted/30 transition-colors duration-500">
                <div className={cn(
                  "mb-6 inline-flex size-12 items-center justify-center rounded-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                  STUDIO.bgSubtle,
                  STUDIO.borderSubtle,
                  STUDIO.text
                )}>
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
   SHARED BADGES
   ═══════════════════════════════════════════════════════════════ */
function RecommendedBadge({ sm = false }: { sm?: boolean }) {
  return (
    <div className={cn(
      "absolute rounded-full font-semibold flex items-center",
      STUDIO.badge,
      sm ? "top-3 left-3 px-2.5 py-1 text-xs gap-1" : "top-4 left-4 px-3 py-1.5 text-xs gap-1.5"
    )}>
      <Star className={cn("fill-current", sm ? "size-3" : "size-3.5")} aria-hidden="true" />
      Recommended
    </div>
  );
}

function PhotoCountBadge({ count, sm = false }: { count: number; sm?: boolean }) {
  return (
    <div className={cn(
      "absolute rounded-full backdrop-blur-sm font-medium",
      OVERLAY.heavy,
      TEXT_OPACITY.normal,
      sm ? "bottom-3 right-3 px-2.5 py-1 text-xs" : "bottom-4 left-4 px-3 py-1.5 text-xs"
    )}>
      {count} photos
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUDIO CARD — single image, no nested scroll
   ═══════════════════════════════════════════════════════════════ */
function StudioCard({ studio }: { studio: Studio }) {
  const images = reorderImages(studio);
  const photoCount = images.length;
  const leadImage = images[0];

  return (
    <Card className={cn(
      "relative shrink-0 overflow-hidden rounded-2xl bg-card/30 hover:shadow-xl group w-[280px] sm:w-[300px] md:w-[340px] snap-start border",
      DURATION.slow,
      STUDIO.borderHover
    )}>
      {/* Lead Photo */}
      {leadImage && (
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={leadImage}
            alt={studio.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 340px"
            loading="lazy"
          />
          <div className={cn("absolute inset-0", GRADIENT.cardOverlay)} />
          {photoCount > 1 && <PhotoCountBadge count={photoCount} sm />}
          {studio.recommended && <RecommendedBadge sm />}
        </div>
      )}

      {/* Info */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-base font-bold tracking-tight leading-snug truncate">
            {studio.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {studio.provider}
          </p>
        </div>

        <div className="mb-4">
          <div className={cn(LABEL.micro, "mb-1")}>Starting Price</div>
          <div className={cn("text-2xl font-black tracking-tight", STUDIO.text)}>
            ฿{studio.startingPrice.toLocaleString()}
            <span className="text-sm font-medium text-muted-foreground ml-1.5">
              / day
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{studio.size}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5 shrink-0" />
            <span>{studio.capacity} ppl</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span className="truncate">{studio.hours}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Banknote className="size-3.5 shrink-0" />
            <span>฿{studio.deposit.toLocaleString()}</span>
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

/* ═══════════════════════════════════════════════════════════════
   FEATURED STUDIO — full-width 2-column layout
   ═══════════════════════════════════════════════════════════════ */
function FeaturedStudio({ studio, images }: { studio: Studio; images: string[] }) {
  const leadImage = images[0];
  const photoCount = images.length;

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl bg-card/30 border", BORDER_OPACITY.medium)}>
      {/* Image Side */}
      <div className="relative aspect-video lg:aspect-auto lg:min-h-96 overflow-hidden">
        {leadImage && (
          <Image
            src={leadImage}
            alt={studio.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
          />
        )}
        <div className={cn("absolute inset-0 bg-gradient-to-t via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent", OVERLAY.light, GRADIENT.featuredRight)} />
        {photoCount > 1 && <PhotoCountBadge count={photoCount} />}
        {studio.recommended && <RecommendedBadge />}
      </div>

      {/* Info Side */}
      <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
        <div className={cn(LABEL.micro, STUDIO.text, "mb-3")}>
          Featured Studio
        </div>
        <h3 className={cn(HEADING.card, "mb-2")}>
          {studio.name}
        </h3>
        <p className="text-muted-foreground mb-6">{studio.provider}</p>

        <div className="mb-8">
          <div className={cn(LABEL.micro, "mb-2")}>Starting Price</div>
          <div className={cn("text-4xl md:text-5xl font-black tracking-tight", STUDIO.text)}>
            ฿{studio.startingPrice.toLocaleString()}
            <span className="text-base font-medium text-muted-foreground ml-2">
              / day
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{studio.size}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4 shrink-0" />
            <span>{studio.capacity} people capacity</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            <span>{studio.hours}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Banknote className="size-4 shrink-0" />
            <span>Deposit ฿{studio.deposit.toLocaleString()}</span>
          </div>
        </div>

        {studio.reference && (
          <Button
            variant="studio"
            size="lg"
            className="rounded-full gap-2 px-7 w-fit"
            onClick={() => window.open(studio.reference, "_blank")}
          >
            View Photos
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StudiosSection({ studios }: { studios: Studio[] }) {
  const featured = studios.find((s) => s.recommended) || studios[0];
  const rest = featured
    ? studios.filter((s) => s.id !== featured.id)
    : studios;
  const featuredImages = featured ? reorderImages(featured) : [];

  return (
    <section id="studios" className={SECTION.py}>
      {/* Section Header */}
      <div className={cn(SECTION.paddingX, "mb-12 md:mb-16")}>
        <div className={SECTION.container}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <Reveal>
              <div className={cn(LABEL.micro, "mb-4")}>Partner Studios</div>
              <h2 className={HEADING.section}>Our Studios</h2>
            </Reveal>
            <Reveal delay={150}>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {studios.length}
                </span>{" "}
                studios available in Bangkok
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Featured Studio */}
      {featured && (
        <div className={cn(SECTION.paddingX, "mb-12 md:mb-16")}>
          <div className={SECTION.container}>
            <Reveal>
              <FeaturedStudio studio={featured} images={featuredImages} />
            </Reveal>
          </div>
        </div>
      )}

      {/* All Studios Carousel */}
      {rest.length > 0 && (
        <div className={SECTION.paddingX}>
          <div className={SECTION.container}>
            <Reveal>
              <div className={cn(LABEL.micro, "mb-4")}>More Studios</div>
            </Reveal>
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 -mx-6 md:-mx-12 lg:-mx-20 px-6 md:px-12 lg:px-20">
              {rest.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
              ))}
            </div>
          </div>
        </div>
      )}
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
    <Card className="relative overflow-hidden bg-background group border-0 ring-0 rounded-2xl shrink-0 w-full snap-start">
      <div className="relative w-full aspect-[9/16]">
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
          <div className={cn("absolute inset-0 flex items-center justify-center", OVERLAY.subtle)}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={playing ? "Pause video" : "Play video"}
              onClick={toggle}
              className={cn("size-16 rounded-full text-background hover:bg-foreground hover:scale-110 transition-all duration-300 backdrop-blur-sm", FG_OPACITY.heavy)}
            >
              <Play className="size-7" fill="currentColor" aria-hidden="true" />
            </Button>
          </div>
        )}
        {/* Title overlay */}
        <div className={cn("absolute top-0 left-0 right-0 p-5", GRADIENT.topFade)}>
          <div className={cn("text-xs uppercase tracking-widest font-medium mb-1", TEXT_OPACITY.dim)}>
            {subtitle}
          </div>
          <div className="text-lg font-bold text-foreground">{title}</div>
        </div>
      </div>
      {/* Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity",
        DURATION.normal,
        GRADIENT.bottomFade
      )}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
            className={cn("size-8 hover:text-foreground hover:bg-foreground/10", TEXT_OPACITY.normal)}
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
            className={cn("size-8 hover:text-foreground hover:bg-foreground/10", TEXT_OPACITY.normal)}
          >
            {muted ? (
              <VolumeX className="size-4" aria-hidden="true" />
            ) : (
              <Volume2 className="size-4" aria-hidden="true" />
            )}
          </Button>
          <div className={cn("flex-1 h-1 rounded-full overflow-hidden", FG_OPACITY.light)}>
            <div
              className={cn("h-full rounded-full transition-all", STUDIO.progress)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Fullscreen"
            onClick={() => videoRef.current?.requestFullscreen()}
            className={cn("size-8 hover:text-foreground hover:bg-foreground/10", TEXT_OPACITY.normal)}
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
    <section id="showreel" className={cn(SECTION.py, "bg-muted/20")}>
      <div className={cn(SECTION.paddingX, "mb-12 md:mb-16")}>
        <div className={cn(SECTION.container, "flex flex-col md:flex-row md:items-end md:justify-between gap-6")}>
          <Reveal>
            <div className={cn(LABEL.micro, "mb-4")}>Showreel</div>
            <h2 className={HEADING.section}>Recent Work</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-sm text-muted-foreground max-w-xs">
              Selected projects from our studio productions and live commerce
              campaigns.
            </p>
          </Reveal>
        </div>
      </div>

      <div className={SECTION.paddingX}>
        <div className={SECTION.container}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SHOWREEL_VIDEOS.map((video) => (
              <VideoCard key={video.title} {...video} />
            ))}
          </div>
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
    <section className={cn(SECTION.paddingX, SECTION.pyLg)}>
      <div className={SECTION.container}>
        <Reveal>
          <div className={cn(
            "relative overflow-hidden rounded-3xl p-10 md:p-16 lg:p-20 border",
            BORDER_OPACITY.medium,
            GRADIENT.cta
          )}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className={cn(HEADING.section, "mb-4")}>
                  Ready to <span className={STUDIO.text}>create</span>?
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Book a studio, match with creators, or just say hi. We reply
                  within 24 hours.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href="mailto:marketing@hypelive.io">
                  <Button
                    variant="studio"
                    size="lg"
                    className="rounded-full gap-2 px-7"
                  >
                    Get in Touch
                    <ArrowRight className="size-4" />
                  </Button>
                </a>
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
      <Capabilities />
      <StudiosSection studios={studios} />
      <Showreel />
      <ContactCTA />
    </div>
  );
}
