// Valida que:
//  1. Cada locales/{idioma}/{hub}/config.json tenga la forma correcta.
//  2. Todos los ids que un hub referencia (phase1_pool y phase2) existan
//     realmente en content/manifest.json.
// Se ejecuta en CI ante cualquier Pull Request que toque locales/ o
// content/manifest.json.
const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "..", "locales");
const manifestPath = path.join(__dirname, "..", "content", "manifest.json");

let hasError = false;

function fail(message) {
  console.error(`ERROR: ${message}`);
  hasError = true;
}

if (!fs.existsSync(manifestPath)) {
  fail("No se encuentra content/manifest.json");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const manifestIds = new Set(Object.keys(manifest));

for (const lang of fs.readdirSync(localesDir)) {
  const langPath = path.join(localesDir, lang);
  if (!fs.statSync(langPath).isDirectory()) continue;

  for (const hub of fs.readdirSync(langPath)) {
    const configPath = path.join(langPath, hub, "config.json");
    if (!fs.existsSync(configPath)) continue;

    const context = `${lang}/${hub}/config.json`;
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {
      fail(`${context}: JSON invalido (${e.message})`);
      continue;
    }

    if (!config.hub || !config.label || !config.country || !config.language) {
      fail(`${context}: faltan campos "hub", "label", "country" o "language"`);
    }

    if (config.hub && config.hub !== hub) {
      fail(
        `${context}: "hub" ("${config.hub}") debe coincidir con el nombre de la carpeta ("${hub}")`
      );
    }

    if (!Array.isArray(config.phase1_pool) || config.phase1_pool.length === 0) {
      fail(`${context}: "phase1_pool" debe ser un array no vacio`);
    } else {
      config.phase1_pool.forEach((id) => {
        if (!manifestIds.has(id)) {
          fail(`${context}: phase1_pool referencia "${id}", que no existe en manifest.json`);
        }
      });
    }

    if (
      typeof config.phase1_sample_size !== "number" ||
      config.phase1_sample_size < 1
    ) {
      fail(`${context}: "phase1_sample_size" debe ser un numero >= 1`);
    }

    if (config.phase2) {
      config.phase2.forEach((entry, i) => {
        if (!entry.id || !manifestIds.has(entry.id)) {
          fail(`${context} phase2[${i}]: "id" no existe en manifest.json`);
        }
        if (!entry.title || !entry.explanation) {
          fail(`${context} phase2[${i}]: falta "title" o "explanation"`);
        }
      });
    }
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log("Todos los config.json son validos.");
}
