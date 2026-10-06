"use client";

import { useEffect } from "react";
import { RTL_LANGUAGES } from "@/lib/i18n";

/**
 * Flips <html lang>/<html dir> to match the active hub's language, so
 * right-to-left scripts (e.g. Pashto) actually read right-to-left instead
 * of inheriting the static "es"/ltr set in the root layout.
 */
export function useDocumentDirection(language?: string | null) {
  useEffect(() => {
    document.documentElement.lang = language || "es";
    document.documentElement.dir = language && RTL_LANGUAGES.includes(language)
      ? "rtl"
      : "ltr";
  }, [language]);
}
