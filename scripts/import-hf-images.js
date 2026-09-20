// Descarga imagenes al azar del dataset Defactify_Image_Dataset (Hugging Face,
// Roy et al., 2026) y las anade al banco: las guarda en content/images/ con
// el siguiente id libre y registra cada una en content/manifest.json.
//
//   node scripts/import-hf-images.js [--ai 50] [--real 50]
//
// Solo se usan fotos reales (MS COCO) e imagenes generadas por Midjourney 6.
// Se toma como maximo una imagen por descripcion (Caption), para que la
// misma escena no aparezca dos veces en el banco.
//
// Despues, revisa las imagenes a ojo y sube con:
//
//   node --env-file=.env.local scripts/upload-images.js
const fs = require("fs");
const path = require("path");

const DATASET = "Rajarshi-Roy-research/Defactify_Image_Dataset";
const SPLIT = "train";
const ROWS_API = "https://datasets-server.huggingface.co/rows";
// Label_B del dataset: 0 = real, 5 = Midjourney 6 (1-4 son otros modelos).
const LABEL_AI = 5;
const LABEL_REAL = 0;

const contentDir = path.join(__dirname, "..", "content");
const imagesDir = path.join(contentDir, "images");
const manifestPath = path.join(contentDir, "manifest.json");

// Ventana de filas contiguas por peticion: menos peticiones (la API limita
// el ritmo) y, al ser varias ventanas en posiciones al azar, sigue siendo
// una muestra dispersa.
const WINDOW = 6;
const REQUEST_GAP_MS = 1500;
// Candidatas extra por clase, por si alguna se descarta (misma escena en ambas clases).
const MARGIN = 10;

// El servidor devuelve todo como binary/octet-stream, asi que el formato se
// detecta por los primeros bytes.
function detectExtension(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  if (buf.subarray(1, 4).toString("latin1") === "PNG") return ".png";
  if (
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return ".webp";
  }
  return null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs() {
  const args = process.argv.slice(2);
  const read = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i === -1 ? fallback : Number(args[i + 1]);
  };
  return { ai: read("--ai", 50), real: read("--real", 50) };
}

async function fetchJson(url, retries = 6) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (attempt >= retries || (res.status !== 429 && res.status < 500)) {
      throw new Error(`${res.status} ${res.statusText} en ${url}`);
    }
    await sleep(2000 * 2 ** attempt);
  }
}

async function fetchWindow(offset, length = WINDOW) {
  const params = new URLSearchParams({
    dataset: DATASET,
    config: "default",
    split: SPLIT,
    offset: String(offset),
    length: String(length),
  });
  const data = await fetchJson(`${ROWS_API}?${params}`);
  return { rows: data.rows, total: data.num_rows_total };
}

async function main() {
  const wanted = parseArgs();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const ids = Object.keys(manifest).map((id) => Number(id.replace("img", "")));
  let nextId = Math.max(0, ...ids) + 1;

  const { total } = await fetchWindow(0, 1);
  console.log(`Dataset con ${total} filas. Objetivo: ${wanted.ai} IA + ${wanted.real} reales.`);

  // Recoge candidatas de ventanas al azar hasta tener de sobra de cada clase.
  const pool = { [LABEL_AI]: [], [LABEL_REAL]: [] };
  const seenRows = new Set();
  const seenCaptions = new Set();
  const enough = () =>
    pool[LABEL_AI].length >= wanted.ai + MARGIN &&
    pool[LABEL_REAL].length >= wanted.real + MARGIN;

  while (!enough()) {
    const offset = Math.floor(Math.random() * (total - WINDOW));
    const { rows } = await fetchWindow(offset);
    for (const { row_idx, row } of rows) {
      if (seenRows.has(row_idx) || !pool[row.Label_B]) continue;
      seenRows.add(row_idx);
      const captionKey = `${row.Label_B}:${row.Caption}`;
      if (seenCaptions.has(captionKey)) continue;
      seenCaptions.add(captionKey);
      pool[row.Label_B].push({ row_idx, src: row.Image.src, caption: row.Caption });
    }
    console.log(`Candidatas: ${pool[LABEL_AI].length} IA, ${pool[LABEL_REAL].length} reales`);
    await sleep(REQUEST_GAP_MS);
  }

  fs.mkdirSync(imagesDir, { recursive: true });
  const newEntries = [];
  const usedCaptions = new Set();

  for (const [label, count] of [[LABEL_AI, wanted.ai], [LABEL_REAL, wanted.real]]) {
    const candidates = pool[label].sort(() => Math.random() - 0.5);
    let saved = 0;
    for (const { row_idx, src, caption } of candidates) {
      if (saved >= count) break;
      if (usedCaptions.has(caption)) continue;
      const imgRes = await fetch(src);
      if (!imgRes.ok) {
        console.error(`Fila ${row_idx}: no se pudo descargar (${imgRes.status})`);
        continue;
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const ext = detectExtension(buf);
      if (!ext) {
        console.error(`Fila ${row_idx}: formato no soportado, se omite`);
        continue;
      }

      usedCaptions.add(caption);
      const id = `img${String(nextId++).padStart(3, "0")}`;
      fs.writeFileSync(path.join(imagesDir, `${id}${ext}`), buf);
      newEntries.push(
        `  "${id}": { "file": "images/${id}${ext}", "is_ai_generated": ${label === LABEL_AI} }`
      );
      saved++;
      console.log(`${id}${ext} <- fila ${row_idx} (${label === LABEL_AI ? "IA" : "real"})`);
    }
  }

  // Se anade al final del manifest respetando su formato (una entrada por linea).
  const text = fs.readFileSync(manifestPath, "utf8").replace(/\s*}\s*$/, "");
  fs.writeFileSync(manifestPath, `${text},\n${newEntries.join(",\n")}\n}\n`);
  console.log(`Listo: ${newEntries.length} imagenes nuevas en content/manifest.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
