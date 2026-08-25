-- AIwareness · Esquema de base de datos
-- Ejecutar en Supabase SQL Editor

-- Esta tabla no se rellena a mano: scripts/sync-hubs.js la mantiene en
-- sincronía con locales/{idioma}/{hub}/config.json cada vez que se
-- fusiona un cambio en main (ver .github/workflows/sync-hubs.yml). Los
-- config.json son la única fuente de verdad sobre qué hubs existen.
create table if not exists hubs (
  id text primary key,               -- ej. 'valencia-hub'
  label text not null,
  country text not null,
  language text not null
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  birth_year int not null check (birth_year > 1900 and birth_year <= extract(year from now())),
  hub text references hubs(id),
  country text not null,
  city text,                          -- opcional
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

-- "attempts" guarda, para cada imagen mostrada: identificador de imagen,
-- si se acertó, la fecha de envío, el país y el año de nacimiento.
-- country y birth_year se guardan denormalizados (duplicados desde
-- participants) precisamente para poder sacar estadísticas por país/edad
-- sin necesidad de JOIN.
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  hub text references hubs(id),
  country text not null,
  birth_year int not null check (birth_year > 1900 and birth_year <= extract(year from now())),
  phase smallint not null check (phase in (1, 2)),
  image_id text not null,
  answered_ai_generated boolean not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

-- Índices para las consultas de estadísticas por país/hub/año
create index if not exists idx_attempts_hub on attempts(hub);
create index if not exists idx_attempts_phase on attempts(phase);
create index if not exists idx_attempts_country on attempts(country);
create index if not exists idx_attempts_birth_year on attempts(birth_year);
create index if not exists idx_attempts_created_at on attempts(created_at);

-- Row Level Security: solo insertar, nunca leer/editar desde el cliente
alter table participants enable row level security;
alter table attempts enable row level security;

create policy "insert_own_participant"
  on participants for insert
  with check (consent = true);

create policy "insert_own_attempt"
  on attempts for insert
  with check (true);

-- No se crean policies de SELECT: la lectura para estadísticas se hace
-- solo con la service_role key desde scripts/analyze_results.py, nunca
-- desde el frontend público.
