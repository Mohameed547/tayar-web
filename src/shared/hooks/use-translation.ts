import { useLanguage } from "@/context/language-context";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";

const messages = { en, ar };

export function useTranslation() {
  const { locale } = useLanguage();

  function t(key: string): string {
    const keys = key.split(".");
    let value: unknown = messages[locale];
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return (value as string) ?? key;
  }

  return { t, locale };
}
