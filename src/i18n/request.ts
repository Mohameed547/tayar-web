import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
} from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get(localeCookieName)?.value;
  const locale = isAppLocale(savedLocale) ? savedLocale : defaultLocale;
  return {
    locale,
    messages: getMessages(locale),
    timeZone: "Africa/Cairo",
  };
});
