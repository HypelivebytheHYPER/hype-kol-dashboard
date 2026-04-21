"use client";

import { BrandLogo } from "./brand-logo";
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border flex flex-col">
      <div className="p-5">
        <BrandLogo />
      </div>
      <NavLinks />
    </div>
  );
}
