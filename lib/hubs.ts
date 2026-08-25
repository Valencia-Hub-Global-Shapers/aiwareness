import type { HubIndexEntry } from "@/lib/types";

/**
 * Carga el índice de hubs disponibles, generado en build a partir de
 * cada locales/{idioma}/{hub}/config.json (ver
 * scripts/copy-locales-to-public.js). No hay lista hardcodeada: un hub
 * nuevo aparece automáticamente en cuanto su config.json existe.
 */
export async function loadHubRegistry(): Promise<HubIndexEntry[]> {
  const response = await fetch("/content/hubs-index.json");
  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de hubs disponibles.");
  }
  return response.json();
}

export function findHub(
  registry: HubIndexEntry[],
  hubId: string
): HubIndexEntry | undefined {
  return registry.find((h) => h.id === hubId);
}
