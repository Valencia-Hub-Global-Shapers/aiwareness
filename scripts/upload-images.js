// Sube todo el contenido de content/images/ al bucket publico
// "aiwareness-images" de Supabase Storage, preservando la misma ruta que
// usan las entradas de content/manifest.json (p. ej. "images/img001.jpg").
//
// Pensado para correr a mano cuando se anaden imagenes nuevas al banco:
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-images.js
//
// No se ejecuta en CI: requiere la service_role key, que no debe
// exponerse a Pull Requests de forks. Lo corre quien mantiene el banco
// de imagenes tras revisar y aceptar la contribucion.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const BUCKET = "aiwareness-images";
const imagesDir = path.join(__dirname, "..", "content", "images");

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function collectFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath, base);
    if (!MIME_TYPES[path.extname(entry.name).toLowerCase()]) return [];
    return [path.relative(base, fullPath)];
  });
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

  if (!fs.existsSync(imagesDir)) {
    console.log("No existe content/images/, nada que subir.");
    return;
  }

  const files = collectFiles(imagesDir);
  if (files.length === 0) {
    console.log("content/images/ no tiene imagenes que subir.");
    return;
  }

  const supabase = createClient(url, key);

  for (const relativePath of files) {
    const objectPath = path.join("images", relativePath).split(path.sep).join("/");
    const filePath = path.join(imagesDir, relativePath);
    const contentType = MIME_TYPES[path.extname(relativePath).toLowerCase()];

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, fs.readFileSync(filePath), {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Error al subir ${objectPath}:`, error.message);
      process.exitCode = 1;
      continue;
    }

    console.log(`Subida: ${objectPath}`);
  }
}

main();
