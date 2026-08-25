export interface ManifestEntry {
  file: string; // ruta relativa dentro de content/images/
  is_ai_generated: boolean;
}

export type Manifest = Record<string, ManifestEntry>;

export interface Phase2Resource {
  id: string; // referencia a una clave del manifest
  title: string;
  explanation: string; // qué fijarse para identificarla, en el idioma del hub
}

export interface HubConfig {
  hub: string;
  label: string; // nombre visible en el selector de hub
  country: string;
  language: string;
  phase1_pool: string[]; // ids del manifest relevantes para este hub
  phase1_sample_size: number; // cuántas se muestran por sesión
  phase2: Phase2Resource[];
}

// Entrada del índice generado en build (ver scripts/copy-locales-to-public.js)
// a partir de cada locales/{idioma}/{hub}/config.json. Es la única fuente
// de verdad sobre qué hubs existen: tanto el selector de la UI como la
// tabla "hubs" de Supabase (ver scripts/sync-hubs.js) se derivan de aquí.
export interface HubIndexEntry {
  id: string;
  label: string;
  country: string;
  language: string;
}

// Imagen ya resuelta (id del hub + datos del manifest), lista para pintar
export interface ResolvedImage {
  id: string;
  file: string;
  is_ai_generated: boolean;
}

export interface Participant {
  id: string; // uuid generado en cliente
  birth_year: number;
  hub: string;
  country: string;
  city?: string;
  consent: boolean;
  created_at?: string;
}

export interface Attempt {
  id?: string;
  participant_id: string;
  hub: string;
  country: string;
  birth_year: number;
  phase: 1 | 2;
  image_id: string;
  answered_ai_generated: boolean;
  correct: boolean;
  created_at?: string;
}
