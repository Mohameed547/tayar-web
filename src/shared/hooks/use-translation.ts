import { useLocale, useTranslations } from "next-intl";

export function useTranslation() {
  const t = useTranslations();
  const locale = useLocale();

  return { t, locale };
}
