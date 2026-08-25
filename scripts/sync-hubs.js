// Sincroniza la tabla "hubs" de Supabase con locales/{idioma}/{hub}/config.json.
//
// Los config.json son la unica fuente de verdad sobre que hubs existen
// (el mismo recorrido lo hace scripts/copy-locales-to-public.js para
// generar public/content/hubs-index.json, que usa la UI). Este script
// hace lo mismo pero contra la base de datos, para que "participants" y
// "attempts" puedan seguir referenciando "hubs" por foreign key sin que
// haga falta insertar filas a mano cada vez que se anade un hub.
//
// Se ejecuta automaticamente en CI al fusionar cambios en locales/**
// (ver .github/workflows/sync-hubs.yml) y tambien se puede correr a mano:
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/sync-hubs.js
//
// Requiere la service_role key (nunca la anon key) porque "hubs" solo
// tiene RLS de lectura para el propio backend, no para el cliente.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const rootDir = path.join(__dirname, "..");
const localesDir = path.join(rootDir, "locales");

function collectHubs() {
  const hubs = [];

  for (const lang of fs.readdirSync(localesDir)) {
    const langPath = path.join(localesDir, lang);
    if (!fs.statSync(langPath).isDirectory()) continue;

    for (const hubDir of fs.readdirSync(langPath)) {
      const configPath = path.join(langPath, hubDir, "config.json");
      if (!fs.existsSync(configPath)) continue;

      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      hubs.push({
        id: config.hub,
        label: config.label,
        country: config.country,
        language: config.language,
      });
    }
  }

  return hubs;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Faltan las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const hubs = collectHubs();
  if (hubs.length === 0) {
    console.log("No hay hubs en locales/, nada que sincronizar.");
    return;
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("hubs").upsert(hubs, { onConflict: "id" });

  if (error) {
    console.error("Error al sincronizar hubs:", error.message);
    process.exit(1);
  }

  console.log(`${hubs.length} hub(s) sincronizados con Supabase:`);
  hubs.forEach((h) => console.log(`  - ${h.id} (${h.label})`));
}

main();
