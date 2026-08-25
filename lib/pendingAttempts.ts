import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Attempt } from "@/lib/types";

const STORAGE_KEY = "aiwareness_pending_attempts";

/**
 * El guardado de "attempts" es intencionalmente silencioso para no
 * bloquear el flujo del quiz (ver app/phase1/page.tsx), pero un insert
 * fallido no puede desaparecer sin más: se encola en localStorage y se
 * reintenta la próxima vez que se cargue /phase1 (ver
 * flushPendingAttempts), por ejemplo tras un corte de wifi puntual.
 */
function readQueue(): Attempt[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(queue: Attempt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function saveAttempt(attempt: Attempt): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from("attempts").insert(attempt);
  if (error) {
    // eslint-disable-next-line no-console
    console.error("No se pudo guardar el intento, se reintentará más tarde:", error.message);
    writeQueue([...readQueue(), attempt]);
  }
}

export async function flushPendingAttempts(): Promise<void> {
  if (!isSupabaseConfigured) return;

  const queue = readQueue();
  if (queue.length === 0) return;

  const stillPending: Attempt[] = [];
  for (const attempt of queue) {
    const { error } = await supabase.from("attempts").insert(attempt);
    if (error) stillPending.push(attempt);
  }
  writeQueue(stillPending);
}
