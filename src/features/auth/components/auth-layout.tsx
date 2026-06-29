"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LocaleToggle } from "@/shared/ui/locale-toggle";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { DelixLogo } from "@/shared/ui/DelixLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
}: AuthLayoutProps) {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--dh-bg-app)] via-[var(--dh-brand-subtle)] to-[var(--dh-bg-page)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic light glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[450px] w-[450px] rounded-full bg-[var(--dh-brand-glow)] blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-[var(--dh-warning-glow)] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo + Language Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <DelixLogo className="h-9 w-9" textClassName="text-2xl font-black tracking-tight text-[var(--dh-text-main)]" />
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LocaleToggle />
          </div>
        </div>

        {/* Card */}
        <div
          className={cn(
            "rounded-2xl border border-[var(--dh-border)] bg-[var(--dh-bg-card)]/90 backdrop-blur-md",
            "shadow-xl shadow-indigo-950/5 p-8",
            className,
          )}
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black tracking-tight text-[var(--dh-text-main)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[var(--dh-text-sub)]">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--dh-text-dim)]">
          © {new Date().getFullYear()} Delix. {t("copyright")}
        </p>
      </div>
    </div>
  );
}
