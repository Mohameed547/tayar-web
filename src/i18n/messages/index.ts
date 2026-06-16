import type { AppLocale } from "@/i18n/config";
import { captainMessages } from "@/i18n/messages/captain";
import { customerMessages } from "@/i18n/messages/customer";
import { landingMessages } from "@/i18n/messages/landing";
import { sharedMessages } from "@/i18n/messages/shared";

export function getMessages(locale: AppLocale) {
  return {
    ...sharedMessages[locale],
    landing: landingMessages[locale],
    customer: customerMessages[locale],
    captain: captainMessages[locale],
  };
}

export type AppMessages = ReturnType<typeof getMessages>;
