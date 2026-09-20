// Iguala la calidad visual de las fotos reales a la de las imagenes de IA
// del banco, para que nadie las distinga por nitidez, resolucion o formato
// en vez de por su contenido. En el dataset Defactify las imagenes de
// Midjourney son todas de 436x436 (cuadradas) y bastante mas suaves que
// las fotos reales de MS COCO (640x480, hasta ~15x mas nitidas).
//
// A cada foto real (is_ai_generated: false en el manifest) se le aplica:
//   1. recorte central a cuadrado y reescalado a SIZE x SIZE,
//   2. desenfoque gaussiano, calibrado por imagen hasta que su nitidez
//      caiga en el rango de las imagenes de IA (ver AI_SHARPNESS),
//   3. recodificado JPEG con la misma calidad para todas (sin EXIF).
//
//   node scripts/normalize-images.js [carpeta]     (por defecto content/images)
//
// Sobrescribe los archivos de las imagenes reales. scripts/import-hf-images.js
// ya lo aplica al descargar, asi que solo hace falta a mano para imagenes
// ya descargadas.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SIZE = 436;
const JPEG_QUALITY = 80;

// Deciles (0%, 10%, ..., 100%) de la nitidez de las imagenes de IA del
// dataset, medida como varianza del laplaciano en escala de grises a 512px
// de ancho (ver sharpness()).
const AI_SHARPNESS = [23, 30, 41, 52, 68, 82, 88, 106, 133, 171, 319];

const manifestPath = path.join(__dirname, "..", "content", "manifest.json");

/** Varianza del laplaciano: cuanto mayor, mas nitida es la imagen. */
async function sharpness(pipeline) {
  const { data, info } = await pipeline
    .greyscale()
    .resize({ width: 512 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = 4 * data[i] - data[i - 1] - data[i + 1] - data[i - w] - data[i + w];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  return sumSq / n - (sum / n) ** 2;
}

/** Nitidez objetivo: un valor al azar de la distribucion de las de IA. */
function randomTargetSharpness() {
  const pos = Math.random() * (AI_SHARPNESS.length - 1);
  const i = Math.floor(pos);
  return AI_SHARPNESS[i] + (AI_SHARPNESS[i + 1] - AI_SHARPNESS[i]) * (pos - i);
}

/** Devuelve el JPEG normalizado (Buffer) de una foto real. */
async function normalizeReal(input) {
  const { data, info } = await sharp(input)
    .rotate()
    .resize(SIZE, SIZE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const raw = { raw: { width: info.width, height: info.height, channels: 3 } };
  const target = randomTargetSharpness();

  // Se mide sobre el JPEG ya codificado, porque la compresion tambien
  // suaviza la imagen.
  const encode = (sigma) =>
    (sigma > 0 ? sharp(data, raw).blur(sigma) : sharp(data, raw))
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

  // Busqueda binaria del sigma cuyo desenfoque deja la nitidez en `target`.
  let sigma = 0;
  if ((await sharpness(sharp(await encode(0)))) > target) {
    let lo = 0.3;
    let hi = 8;
    for (let i = 0; i < 10; i++) {
      const mid = (lo + hi) / 2;
      const s = await sharpness(sharp(await encode(mid)));
      if (s > target) lo = mid;
      else hi = mid;
    }
    sigma = (lo + hi) / 2;
  }

  return encode(sigma);
}

async function main() {
  const dir = path.resolve(process.argv[2] || path.join(__dirname, "..", "content", "images"));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  let count = 0;
  for (const entry of Object.values(manifest)) {
    if (entry.is_ai_generated || !entry.file.endsWith(".jpg")) continue;
    const file = path.join(dir, path.basename(entry.file));
    if (!fs.existsSync(file)) continue;
    fs.writeFileSync(file, await normalizeReal(fs.readFileSync(file)));
    count++;
  }
  console.log(`Normalizadas ${count} fotos reales en ${dir}.`);
}

module.exports = { normalizeReal };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
