"use client";

import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface BrandLogoProps {
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}

export function BrandLogo({ size = "md", onClick, className }: BrandLogoProps) {
  const isSmall = size === "sm";

  return (
    <Link
      href={ROUTES.KOLS}
      {...(onClick ? { onClick } : {})}
      className={cn("flex items-center gap-2.5", className)}
    >
      <Image
        src={BRAND.logoUrl}
        alt=""
        width={isSmall ? 28 : 36}
        height={isSmall ? 28 : 36}
        className="rounded-lg drop-shadow-md"
        aria-hidden="true"
      />
      <span className={cn("font-bold tracking-tight", isSmall ? "text-base" : "text-lg")}>
        {BRAND.name}
      </span>
    </Link>
  );
}
