// Crea (de forma idempotente) el bucket publico "aiwareness-images" en
// Supabase Storage, donde vive el banco de imagenes real. Se corre una
// sola vez por proyecto, a mano:
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-storage.js
//
// Ver README.md, seccion "Banco de imagenes", para el resto del flujo
// (scripts/upload-images.js sube los archivos; lib/images.ts resuelve
// las URLs publicas en tiempo de ejecucion).
const { createClient } = require("@supabase/supabase-js");

const BUCKET = "aiwareness-images";

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Faltan las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error al listar buckets:", listError.message);
    process.exit(1);
  }

  if (buckets.some((b) => b.name === BUCKET)) {
    console.log(`El bucket "${BUCKET}" ya existe, nada que hacer.`);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (createError) {
    console.error("Error al crear el bucket:", createError.message);
    process.exit(1);
  }

  console.log(`Bucket "${BUCKET}" creado como publico de solo lectura.`);
}

main();
