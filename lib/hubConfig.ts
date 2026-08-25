import type { HubConfig, Manifest } from "@/lib/types";

/**
 * Carga el config.json de un hub concreto. Los archivos de /locales se
 * copian a /public/locales en build (ver scripts/copy-locales-to-public.js),
 * así que quedan disponibles como assets estáticos servidos por Next.js.
 */
export async function loadHubConfig(
  language: string,
  hub: string
): Promise<HubConfig> {
  const response = await fetch(`/locales/${language}/${hub}/config.json`);
  if (!response.ok) {
    throw new Error(
      `No se pudo cargar la configuración del hub "${hub}" (${language}).`
    );
  }
  return response.json();
}

/**
 * Carga el banco de imágenes compartido (verdad sobre cada imagen).
 */
export async function loadManifest(): Promise<Manifest> {
  const response = await fetch("/content/manifest.json");
  if (!response.ok) {
    throw new Error("No se pudo cargar el banco de imágenes compartido.");
  }
  return response.json();
}
