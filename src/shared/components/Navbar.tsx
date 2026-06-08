"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Truck } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const navLinks = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Features",     href: "/#features" },
  { label: "About Us",     href: "/#about" },
  { label: "Contact",      href: "/#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[rgba(11,17,32,0.85)] backdrop-blur-md">
      <div className="h-16 flex items-center justify-between px-4 md:px-10">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--blue)] shadow-[0_0_20px_var(--blue-glow)]">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
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
          <Link
            href={ROUTES.LOGIN}
            className="text-lg px-3 md:px-4 py-2 rounded-lg bg-transparent transition-all duration-200 border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-[var(--blue)]"
          >
            Login
          </Link>

          <Link
            href={ROUTES.REGISTER_CUSTOMER}
            className="text-white text-lg font-medium px-3 md:px-4 py-2 rounded-lg transition-all duration-200 bg-[var(--blue)] shadow-[0_0_24px_var(--blue-glow)] hover:opacity-85 hover:shadow-[0_0_36px_var(--blue-glow)]"
          >
            Sign Up
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white ml-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[rgba(11,17,32,0.98)]">
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
            <Link href={ROUTES.LOGIN} onClick={() => setIsOpen(false)} className="text-lg text-[var(--text-muted)] hover:text-white">Login</Link>
            <Link href={ROUTES.REGISTER_CUSTOMER} onClick={() => setIsOpen(false)} className="text-lg text-blue-400 font-medium">Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
