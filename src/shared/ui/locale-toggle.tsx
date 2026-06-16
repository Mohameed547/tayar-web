"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { localeCookieName, type AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LocaleToggle({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const t = useTranslations("common");

  const nextLocale: AppLocale = locale === "en" ? "ar" : "en";

  function switchLocale() {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors",
        "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        className,
      )}
      aria-label={t("changeLanguage")}
      title={t("changeLanguage")}
    >
      <Languages className="h-4 w-4" />
      <span>{locale === "en" ? "العربية" : "English"}</span>
    </button>
  );
}
