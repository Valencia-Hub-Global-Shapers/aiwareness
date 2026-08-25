const BUCKET = "aiwareness-images";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Resuelve la ruta de una imagen del manifest (p. ej. "images/img001.jpg")
 * a una URL cargable por <Image>.
 *
 * Si hay un proyecto de Supabase configurado, las imágenes se sirven
 * desde el bucket público "aiwareness-images" (ver scripts/setup-storage.js
 * y scripts/upload-images.js) en vez de vivir en el repositorio: así el
 * banco de imágenes puede crecer sin inflar el clon de git ni requerir un
 * redeploy para publicar contenido nuevo.
 *
 * En modo solo-interfaz (sin Supabase, ver lib/supabaseClient.ts) se cae
 * a /content/images/, copiado como asset estático local por
 * scripts/copy-locales-to-public.js — útil para desarrollar sin backend.
 */
export function getImageUrl(file: string): string {
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${file}`;
  }
  // "file" ya incluye el prefijo "images/" (ver content/manifest.json),
  // y scripts/copy-locales-to-public.js copia content/ tal cual a
  // public/content/, así que la ruta local es "/content/" + file.
  return `/content/${file}`;
}
