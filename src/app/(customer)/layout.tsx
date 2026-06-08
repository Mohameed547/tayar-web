"use client";

import { useState } from "react";
import Sidebar from "@/shared/components/sidebar";
import Topbar from "@/shared/components/topbar";
import MobileNav from "@/shared/components/mobile-nav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      {/* Sidebar navigation for desktop */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile navigation drawer */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main page panel */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top bar header */}
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable content canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
