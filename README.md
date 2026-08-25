# AIwareness

Proyecto global de Global Shapers para concienciar sobre contenido generado
por IA. Fase 1: reconocimiento rápido (imagen real vs. IA). Fase 2:
formación con explicaciones localizadas por hub.

## Estructura del repositorio

```
aiwareness/
├── app/                     # Next.js App Router
│   ├── page.tsx              # Onboarding: año nacimiento + hub/país
│   ├── phase1/page.tsx       # Modo simple/nativo digital
│   ├── results/page.tsx      # Resumen de aciertos
│   └── phase2/page.tsx       # Módulo formativo
├── components/
│   └── ImageCard.tsx          # Tarjeta con botones grandes + swipe opcional
├── lib/
│   ├── supabaseClient.ts
│   ├── images.ts              # Resuelve URLs de imagen (Storage o local)
│   ├── pendingAttempts.ts     # Cola de reintento para inserts fallidos
│   ├── hubs.ts                # Carga el índice de hubs generado en build
│   ├── sampling.ts            # Aleatorizador: N imágenes del pool del hub
│   └── types.ts
├── content/
│   ├── manifest.json          # Banco global: id -> {file, is_ai_generated}
│   └── images/                # Copia local para desarrollo sin Supabase
├── locales/
│   └── {idioma}/{hub}/config.json
│       # Cada hub NO sube imágenes propias: solo elige, por id, qué
│       # subconjunto del pool usar (phase1_pool) y añade sus textos
│       # explicativos localizados (phase2). "hub"/"label"/"country"/
│       # "language" son la ÚNICA fuente de verdad sobre qué hubs
│       # existen — no hay ninguna lista hardcodeada en el código.
├── supabase/
│   └── schema.sql             # Modelo de datos completo
├── scripts/
│   ├── analyze_results.py     # Estadísticas por país/hub/edad (PEP 8)
│   ├── validate-configs.js    # Valida configs + referencias al manifest
│   ├── copy-locales-to-public.js  # Genera hubs-index.json + assets estáticos
│   ├── sync-hubs.js           # Sincroniza locales/ -> tabla "hubs"
│   ├── setup-storage.js       # Crea el bucket de imágenes (una vez)
│   └── upload-images.js       # Sube content/images/ al bucket
└── .env.example
```

### Cómo funciona el banco de imágenes compartido

En vez de que cada hub suba y mantenga su propio set de imágenes, hay
**un único banco compartido**, con la verdad sobre cada imagen (¿es real
o generada por IA?) centralizada en `content/manifest.json`:

```json
{
  "img001": { "file": "images/img001.jpg", "is_ai_generated": true }
}
```

Las imágenes en sí viven en **Supabase Storage** (bucket público
`aiwareness-images`), no en el repositorio — así el banco puede crecer
sin inflar el clon de git y sin necesitar un redeploy para publicar
contenido nuevo. `lib/images.ts` resuelve la ruta del manifest a la URL
pública del bucket; en local, si no hay un proyecto de Supabase
configurado, cae automáticamente a servir las imágenes que tengas en
`content/images/` como assets estáticos (modo solo-interfaz, ver más
abajo).

Cada hub, en su `config.json`, simplemente declara qué subconjunto de
ese banco es culturalmente relevante para su región y cuántas se
muestran por sesión:

```json
{
  "phase1_pool": ["img001", "img002", "img003", "..."],
  "phase1_sample_size": 10
}
```

En cada partida, `lib/sampling.ts` elige aleatoriamente
`phase1_sample_size` imágenes de ese `phase1_pool`. Así, con un banco de
(por ejemplo) 50 imágenes, cada usuario ve una combinación distinta de
10, y un hub puede tener un pool de 50 mientras otro usa solo 15 de esas
mismas imágenes si son las que le resultan relevantes.

### Cómo funciona el registro de hubs

No hay ninguna lista de hubs escrita a mano en el código. La carpeta
`locales/{idioma}/{hub}/config.json` es la única fuente de verdad:

- En build/dev, `scripts/copy-locales-to-public.js` recorre todos los
  `config.json` y genera `public/content/hubs-index.json`. El selector
  de hub del onboarding (`app/page.tsx`) lo carga vía `lib/hubs.ts`.
- En CI, `scripts/sync-hubs.js` hace el mismo recorrido y sincroniza
  (upsert) la tabla `hubs` de Supabase, para que los `insert` en
  `participants`/`attempts` no fallen por la foreign key. Se ejecuta
  automáticamente al fusionar cambios en `locales/**` sobre `main` (ver
  `.github/workflows/sync-hubs.yml`) — **añadir un hub nuevo no requiere
  ningún paso manual en Supabase ni tocar código.**

## 1. Requisitos previos

- Cuenta de [GitHub](https://github.com) (ya la tenéis, es donde vive el repo).
- Cuenta de [Supabase](https://supabase.com) (gratis, plan Free es suficiente
  para empezar: 500MB de base de datos, 1GB de almacenamiento de archivos y
  5GB de transferencia al mes).
- Cuenta de [Vercel](https://vercel.com) (gratis, se conecta directo al repo
  de GitHub).
- Node.js 18+ instalado localmente si quieres probar antes de desplegar.

## 2. Despliegue paso a paso

### A. Supabase (base de datos + almacenamiento)

1. Crea un proyecto nuevo en https://app.supabase.com.
2. Ve a **SQL Editor** y pega el contenido de `supabase/schema.sql`. Esto
   crea las tablas `participants`, `attempts` y `hubs` (esta última la
   rellena `scripts/sync-hubs.js` automáticamente, no hace falta insertar
   filas a mano).
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`
   - `service_role key` (solo para scripts de mantenimiento, nunca para el
     frontend)
4. Crea el bucket de imágenes ejecutando localmente:
   ```bash
   SUPABASE_URL=https://tu-proyecto.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key \
   node scripts/setup-storage.js
   ```
   Esto crea el bucket público `aiwareness-images` (solo hace falta una vez
   por proyecto).
5. Sube las imágenes reales que tengas en `content/images/`:
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-images.js
   ```
   Repite este paso cada vez que se añadan imágenes nuevas al banco.

### B. GitHub (repositorio de contenido y código)

1. Crea un repo nuevo, por ejemplo `globalshapers/aiwareness`.
2. Sube todo este scaffold.
3. En **Settings → Secrets and variables → Actions**, añade dos secrets a
   nivel de repositorio: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (los
   mismos valores del paso A.3). Los usa `.github/workflows/sync-hubs.yml`
   para mantener la tabla `hubs` sincronizada cada vez que se fusiona un
   hub nuevo — sin esto, el paso "añadir un hub" queda incompleto y los
   participantes de ese hub no podrán guardar sus respuestas.
4. Cada hub que se una añade su carpeta en `locales/{idioma}/{hub}/` con su
   `config.json` vía Pull Request (ver sección 4). `.github/workflows/ci.yml`
   corre lint + build en cada PR; `validate.yml` valida el contenido de
   `locales/`; `sync-hubs.yml` sincroniza Supabase al fusionar a `main`.

### C. Vercel (despliegue de la app)

1. En https://vercel.com, **Add New → Project** e importa el repo de
   GitHub.
2. Framework preset: Next.js (detectado automático).
3. En **Environment Variables** añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key de Supabase

   No añadas aquí la `service_role key`: no la usa la app, solo los
   scripts de `scripts/`.
4. Deploy. Cada push a `main` vuelve a desplegar automáticamente.
5. (Opcional) Configura un dominio propio en **Project Settings → Domains**,
   por ejemplo `aiwareness.globalshapers.org`.
6. Antes de anunciar el lanzamiento, haz una prueba real de extremo a
   extremo: completa el onboarding en el sitio desplegado y confirma en
   Supabase (**Table Editor**) que aparece la fila en `participants`. Si
   falla, lo más probable es que el hub elegido no esté aún en la tabla
   `hubs` (revisa que `sync-hubs.yml` se haya ejecutado correctamente).

## 3. Desarrollo local

```bash
npm install
cp .env.example .env.local   # rellena con tus claves de Supabase
npm run dev
```

Abre http://localhost:3000

**Modo solo-interfaz (sin Supabase):** si aún no tienes un proyecto de
Supabase, puedes saltarte el paso de rellenar `.env.local` y ejecutar
`npm run dev` igualmente. La app detecta que faltan las credenciales y
navega por todo el flujo (onboarding, fase 1, resultados, fase 2) sin
guardar nada en base de datos, sirviendo las imágenes desde
`content/images/` en vez de Supabase Storage — ideal para revisar diseño
y UX antes de tener el backend listo. Verás un aviso en la consola del
navegador recordándolo.

## 4. Cómo un hub añade su contenido (contribución vía PR)

**Caso A — usar imágenes que ya existen en el banco compartido:**

1. Fork o rama nueva.
2. Copiar `locales/es/valencia-hub/config.json` como plantilla dentro de
   `locales/{tu-idioma}/{tu-hub}/config.json`, rellenando `hub` (debe
   coincidir con el nombre de la carpeta), `label` (nombre visible en el
   selector), `country` y `language`.
3. Elegir, por id, qué imágenes de `content/manifest.json` forman el
   `phase1_pool` de tu hub y cuántas (`phase1_sample_size`) se muestran
   por sesión.
4. Escribir los textos de `phase2` (título + explicación) en tu idioma
   para las imágenes que quieras usar como material formativo.
5. Abrir PR. `.github/workflows/validate.yml` comprueba automáticamente
   que el JSON es válido y que todos los ids referenciados existen en el
   manifest; `.github/workflows/ci.yml` comprueba que el build sigue
   funcionando.
6. Al fusionar a `main`, `.github/workflows/sync-hubs.yml` da de alta el
   hub en Supabase automáticamente y Vercel redespliega. No hace falta
   ningún paso manual adicional.

**Caso B — aportar imágenes nuevas al banco compartido:**

1. Añade las imágenes nuevas a `content/images/images/` (formato
   .jpg/.png/.webp, máx. ~5MB cada una) con el siguiente id disponible
   (`img013.jpg`, `img014.jpg`...).
2. Añade su entrada en `content/manifest.json` con `is_ai_generated`
   (true/false).
3. Referencia esos nuevos ids desde tu `config.json` como en el Caso A.
   Otros hubs también podrán usarlas si les resultan relevantes.
4. Tras fusionar el PR, quien mantenga el proyecto ejecuta
   `node scripts/upload-images.js` (con la `service_role key`) para
   subir las imágenes nuevas al bucket — este paso no está automatizado
   en CI a propósito, porque requiere una clave que no debe exponerse a
   Pull Requests externos.

## 5. Estadísticas

`scripts/analyze_results.py` se conecta a Supabase con la `service_role
key` (nunca la expongáis en el frontend) y exporta a CSV la tasa de
acierto por país, hub, fase y franja de edad. Requiere Python 3.10+:

```bash
pip install supabase pandas
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
python scripts/analyze_results.py
```

## Notas de privacidad (RGPD)

- Por cada imagen respondida se guarda: identificador de imagen, si se
  acertó, la fecha de envío, el país y el año de nacimiento — sin fecha
  de nacimiento completa ni ciudad exacta.
- El identificador de usuario es anónimo (UUID generado en el navegador),
  no hay login ni email obligatorio.
- Añadir un checkbox de consentimiento antes de guardar datos (ya incluido
  en `app/page.tsx`).
