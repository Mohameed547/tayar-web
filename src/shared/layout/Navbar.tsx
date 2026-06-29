"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { LocaleToggle } from "@/shared/ui/locale-toggle";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { DelixLogo } from "@/shared/ui/DelixLogo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const t = useTranslations("navigation");
  const navLinks = [
    { label: t("howItWorks"), href: "/#how-it-works" },
    { label: t("features"), href: "/#features" },
    { label: t("about"), href: "/#about" },
    { label: t("contact"), href: "/#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--dh-border)] bg-[var(--dh-bg-nav)] backdrop-blur-md transition-all duration-300">
      <div className="h-16 flex items-center justify-between px-4 md:px-10">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 no-underline hover:opacity-90 transition-opacity">
          <DelixLogo className="h-7 w-7" textClassName="font-display font-extrabold text-xl text-[var(--dh-text-main)] tracking-tight" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 list-none">
          {navLinks.map((link) => (
            <li key={link.label} className="relative">
              <Link
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
                className="text-sm font-medium transition-colors duration-300"
                style={{ color: hoveredLink === link.label ? "var(--dh-text-main)" : "var(--dh-text-sub)" }}
              >
                {link.label}
              </Link>
              <span
                className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 bg-[var(--dh-brand)]"
                style={{
                  width: hoveredLink === link.label ? "100%" : "0%",
                  boxShadow: hoveredLink === link.label ? "0 0 8px var(--dh-brand-glow)" : "none",
                }}
              />
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle className="border-[var(--dh-border)] bg-transparent text-[var(--dh-text-main)] dark:bg-transparent" />
          <LocaleToggle className="hidden border-[var(--dh-border)] bg-transparent text-[var(--dh-text-main)] dark:bg-transparent sm:inline-flex" />

          <Link
            href={ROUTES.LOGIN}
            className="text-sm px-3 md:px-4 py-2 rounded-xl bg-transparent transition-all duration-300 border border-[var(--dh-border)] text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] hover:border-[var(--dh-brand)] hover:bg-[var(--dh-brand-subtle)]"
          >
            {t("login")}
          </Link>

          <Link
            href={ROUTES.REGISTER_CUSTOMER}
            className="text-white text-sm font-semibold px-3 md:px-4 py-2 rounded-xl transition-all duration-300 bg-[var(--dh-brand)] shadow-[0_4px_12px_var(--dh-brand-glow)] hover:bg-[var(--dh-brand-hover)] active:scale-[0.98]"
          >
            {t("signUp")}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[var(--dh-text-main)] ml-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--dh-border)] bg-[var(--dh-bg-nav-strong)]">
          <div className="flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-[var(--dh-border)]" />
            <Link href={ROUTES.LOGIN} onClick={() => setIsOpen(false)} className="text-sm text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)]">{t("login")}</Link>
            <Link href={ROUTES.REGISTER_CUSTOMER} onClick={() => setIsOpen(false)} className="text-sm text-[var(--dh-brand)] font-semibold">{t("signUp")}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
