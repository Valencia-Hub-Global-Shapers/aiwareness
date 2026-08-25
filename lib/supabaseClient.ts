import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * true si hay credenciales de Supabase configuradas en .env.local.
 * Se usa para permitir probar la interfaz en local sin backend: si es
 * false, el resto de la app se salta los guardados en base de datos en
 * vez de fallar.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "La app funciona en modo solo-interfaz: no se guardará nada en " +
      "base de datos. Configura .env.local (ver .env.example) cuando " +
      "quieras probar el guardado real."
  );
}

// En modo solo-interfaz creamos el cliente igualmente con valores dummy
// para que las llamadas .from(...).insert(...) no rompan la app; se
// interceptan antes de llamarlas en cada página (ver isSupabaseConfigured).
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
