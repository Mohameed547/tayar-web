"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { StoreProvider } from "@/shared/providers/store-provider";
import { SocketNotificationProvider } from "@/shared/providers/socket-notification-provider";
import { SocketProvider } from "@/shared/socket";
import type { Theme } from "@/shared/config/theme";

interface AppProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  theme: Theme;
}

export function AppProviders({
  children,
  locale,
  messages,
  theme,
}: AppProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Africa/Cairo">
      <StoreProvider>
        <ThemeProvider initialTheme={theme}>
          <SocketProvider>
            <SocketNotificationProvider>{children}</SocketNotificationProvider>
          </SocketProvider>
        </ThemeProvider>
      </StoreProvider>
    </NextIntlClientProvider>
  );
}
