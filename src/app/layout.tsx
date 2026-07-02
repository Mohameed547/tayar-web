import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getLocale, getMessages } from "next-intl/server";
import ConditionalShell from "./ConditionalShell";
import { getLocaleDirection, type AppLocale } from "@/i18n/config";
import { AppProviders } from "@/shared/providers/app-providers";
import {
  themeCookieName,
  type Theme,
} from "@/shared/config/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tayar",
  description: "Smart shipping platform. Your deal. Our delivery. Done.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, messages, cookieStore] = await Promise.all([
    getLocale(),
    getMessages(),
    cookies(),
  ]);
  const savedTheme = cookieStore.get(themeCookieName)?.value;
  const theme: Theme = savedTheme === "dark" ? "dark" : "light";
  const direction = getLocaleDirection(locale as AppLocale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={theme === "dark" ? "dark" : undefined}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body>
        <AppProviders locale={locale} messages={messages} theme={theme}>
          <ConditionalShell>{children}</ConditionalShell>
        </AppProviders>
      </body>
    </html>
  );
}

