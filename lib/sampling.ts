import type { Manifest, HubConfig, ResolvedImage } from "@/lib/types";

/**
 * Baraja un array sin mutar el original (Fisher-Yates).
 */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Selecciona aleatoriamente `sampleSize` imágenes del pool del hub y las
 * resuelve contra el manifest global (ruta de archivo + etiqueta real).
 *
 * Si el pool del hub es más pequeño que sampleSize, se devuelve el pool
 * completo barajado.
 */
export function sampleHubImages(
  config: HubConfig,
  manifest: Manifest
): ResolvedImage[] {
  const sampleSize = Math.min(
    config.phase1_sample_size,
    config.phase1_pool.length
  );

  const chosenIds = shuffle(config.phase1_pool).slice(0, sampleSize);

  return chosenIds
    .filter((id) => manifest[id] !== undefined)
    .map((id) => ({
      id,
      file: manifest[id].file,
      is_ai_generated: manifest[id].is_ai_generated,
    }));
}
