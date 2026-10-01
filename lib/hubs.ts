import type { HubIndexEntry } from "@/lib/types";

/**
 * Hub de uso intencional: no pertenece a ninguna ciudad. Va siempre al
 * final de las listas y nunca se preselecciona, para que nadie lo elija
 * por error en lugar de su ciudad.
 */
export const GENERIC_HUB_ID = "generic-hub";

/** Ordena los hubs alfabéticamente dejando el hub genérico siempre al final. */
export function sortHubs(hubs: HubIndexEntry[]): HubIndexEntry[] {
  return [...hubs].sort((a, b) => {
    const aGeneric = a.id === GENERIC_HUB_ID;
    const bGeneric = b.id === GENERIC_HUB_ID;
    if (aGeneric !== bGeneric) return aGeneric ? 1 : -1;
    return a.label.localeCompare(b.label);
  });
}

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
