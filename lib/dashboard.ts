import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { sortHubs } from "@/lib/hubs";
import type { HubIndexEntry, Manifest } from "@/lib/types";

export interface ParticipantRow {
  hub: string;
  birth_year: number;
  n: number;
}

export interface ImageRow {
  hub: string;
  image_id: string;
  shown: number;
  correct: number;
  said_ai: number;
}

export interface BirthYearRow {
  hub: string;
  birth_year: number;
  attempts: number;
  correct: number;
}

export interface DailyRow {
  hub: string;
  day: string;
  participants: number;
  attempts: number;
}

export interface DashboardStats {
  participants: ParticipantRow[];
  images: ImageRow[];
  by_birth_year: BirthYearRow[];
  daily: DailyRow[];
}

export interface DashboardData {
  hubs: HubIndexEntry[];
  manifest: Manifest;
  stats: DashboardStats | null;
  generatedAt: string;
}

/**
 * Lee los hubs directamente de locales/{idioma}/{hub}/config.json, la
 * misma fuente de verdad que usa el selector de la app.
 */
function readHubs(): HubIndexEntry[] {
  const root = path.join(process.cwd(), "locales");
  const hubs: HubIndexEntry[] = [];
  for (const lang of fs.readdirSync(root)) {
    const langDir = path.join(root, lang);
    if (!fs.statSync(langDir).isDirectory()) continue;
    for (const hubId of fs.readdirSync(langDir)) {
      const file = path.join(langDir, hubId, "config.json");
      if (!fs.existsSync(file)) continue;
      const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
      hubs.push({
        id: cfg.hub,
        label: cfg.label,
        country: cfg.country,
        language: cfg.language,
      });
    }
  }
  return sortHubs(hubs);
}

function readManifest(): Manifest {
  const file = path.join(process.cwd(), "content", "manifest.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * Carga los agregados con la funcion dashboard_stats() (ver
 * supabase/dashboard.sql). Solo devuelve totales, nunca filas
 * individuales, por eso basta con la anon key.
 */
export async function loadDashboardData(): Promise<DashboardData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let stats: DashboardStats | null = null;

  if (url && key) {
    const client = createClient(url, key);
    const { data, error } = await client.rpc("dashboard_stats");
    if (!error && data) stats = data as DashboardStats;
  }

  return {
    hubs: readHubs(),
    manifest: readManifest(),
    stats,
    generatedAt: new Date().toISOString(),
  };
}
