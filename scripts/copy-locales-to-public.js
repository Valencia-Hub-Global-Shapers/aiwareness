// Copia /locales y /content dentro de /public antes del build, para que
// Next.js pueda servir los config.json de cada hub y el banco de
// imagenes compartido como assets estaticos:
//   /locales/es/valencia-hub/config.json
//   /content/images/img001.jpg
//
// Ademas genera /public/content/hubs-index.json recorriendo cada
// locales/{idioma}/{hub}/config.json: ese indice es la unica fuente de
// verdad sobre que hubs existen (ver lib/hubs.ts y scripts/sync-hubs.js,
// que usa el mismo recorrido para mantener la tabla "hubs" de Supabase
// sincronizada). Anadir un hub nuevo ya no requiere tocar codigo: basta
// con su carpeta en locales/.
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const localesDir = path.join(rootDir, "locales");

function copyDir(name) {
  const source = path.join(rootDir, name);
  const destination = path.join(rootDir, "public", name);

  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
  console.log(`${name}/ copiado a public/${name}/`);
}

function buildHubIndex() {
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

  const outPath = path.join(rootDir, "public", "content", "hubs-index.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(hubs, null, 2));
  console.log(`content/hubs-index.json generado (${hubs.length} hubs).`);
}

copyDir("locales");
copyDir("content");
buildHubIndex();
