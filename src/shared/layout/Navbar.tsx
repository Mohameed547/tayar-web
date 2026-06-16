"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, Truck } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { LocaleToggle } from "@/shared/ui/locale-toggle";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--nav-surface)] backdrop-blur-md">
      <div className="h-16 flex items-center justify-between px-4 md:px-10">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--blue)] shadow-[0_0_20px_var(--blue-glow)]">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-[var(--landing-text)] tracking-tight">
            DeliveryHub
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 list-none">
          {navLinks.map((link) => (
            <li key={link.label} className="relative">
              <Link
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
                className="text-lg transition-colors duration-200"
                style={{ color: hoveredLink === link.label ? "white" : "var(--text-muted)" }}
              >
                {link.label}
              </Link>
              <span
                className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 bg-[var(--blue)]"
                style={{
                  width: hoveredLink === link.label ? "100%" : "0%",
                  boxShadow: hoveredLink === link.label ? "0 0 8px var(--blue-glow)" : "none",
                }}
              />
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle className="border-[var(--border)] bg-transparent text-[var(--landing-text)] dark:bg-transparent" />
          <LocaleToggle className="hidden border-[var(--border)] bg-transparent text-[var(--landing-text)] dark:bg-transparent sm:inline-flex" />

          <Link
            href={ROUTES.LOGIN}
            className="text-lg px-3 md:px-4 py-2 rounded-lg bg-transparent transition-all duration-200 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--landing-text)] hover:border-[var(--blue)]"
          >
            {t("login")}
          </Link>

          <Link
            href={ROUTES.REGISTER_CUSTOMER}
            className="text-white text-lg font-medium px-3 md:px-4 py-2 rounded-lg transition-all duration-200 bg-[var(--blue)] shadow-[0_0_24px_var(--blue-glow)] hover:opacity-85 hover:shadow-[0_0_36px_var(--blue-glow)]"
          >
            {t("signUp")}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[var(--landing-text)] ml-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--nav-surface-strong)]">
          <div className="flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg text-[var(--text-muted)] hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-[var(--border)]" />
            <Link href={ROUTES.LOGIN} onClick={() => setIsOpen(false)} className="text-lg text-[var(--text-muted)] hover:text-white">{t("login")}</Link>
            <Link href={ROUTES.REGISTER_CUSTOMER} onClick={() => setIsOpen(false)} className="text-lg text-blue-400 font-medium">{t("signUp")}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
