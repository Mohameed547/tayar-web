"use client";

import { useTranslations } from "next-intl";

export function useCaptainTranslations() {
  const translate = useTranslations("captain");

  return (key: string) => translate(key as never);
}
