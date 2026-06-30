"use client";

import { useState } from "react";
import Sidebar from "@/shared/layout/Sidebar";
import Topbar from "@/shared/layout/Topbar";
import MobileNav from "@/shared/layout/mobile-nav";
import GlobalLiveChat from "@/features/support/components/GlobalLiveChat";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className="customer-surface flex h-screen w-screen overflow-hidden bg-[var(--dh-bg-app)]"
      data-surface="customer"
    >
      {/* Sidebar navigation for desktop */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile navigation drawer */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main page panel */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top bar header */}
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable content canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--dh-bg-app)]">
          {children}
        </main>
      </div>

      {/* Reusable floating support live chat */}
      <GlobalLiveChat />
    </div>
  );
}
