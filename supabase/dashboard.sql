-- AIwareness · Funcion de estadisticas para /dashboard
-- Ejecutar una vez en Supabase SQL Editor (despues de schema.sql).
--
-- Las tablas no tienen policies de SELECT, asi que el frontend no puede
-- leerlas. Esta funcion (security definer) devuelve SOLO agregados, sin
-- filas individuales ni ids de participante, y se expone a la anon key.
-- Asi /dashboard no necesita la service_role key en Vercel.
create or replace function dashboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    -- Participantes que respondieron al menos una imagen, por hub y
    -- año de nacimiento.
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'hub', s.hub, 'birth_year', s.birth_year, 'n', s.n))
      from (
        select p.hub, p.birth_year, count(*) as n
        from participants p
        where exists (select 1 from attempts a where a.participant_id = p.id)
        group by p.hub, p.birth_year
      ) s
    ), '[]'::jsonb),
    -- Resultados por imagen y hub (fase 1).
    'images', coalesce((
      select jsonb_agg(jsonb_build_object(
        'hub', s.hub, 'image_id', s.image_id, 'shown', s.shown,
        'correct', s.correct, 'said_ai', s.said_ai))
      from (
        select hub, image_id,
               count(*) as shown,
               count(*) filter (where correct) as correct,
               count(*) filter (where answered_ai_generated) as said_ai
        from attempts
        where phase = 1
        group by hub, image_id
      ) s
    ), '[]'::jsonb),
    -- Aciertos por hub y rango de nacimiento, para la curva por edad.
    'by_birth_year', coalesce((
      select jsonb_agg(jsonb_build_object(
        'hub', s.hub, 'birth_year', s.birth_year,
        'attempts', s.attempts, 'correct', s.correct))
      from (
        select hub, birth_year,
               count(*) as attempts,
               count(*) filter (where correct) as correct
        from attempts
        where phase = 1
        group by hub, birth_year
      ) s
    ), '[]'::jsonb),
    -- Actividad diaria por hub.
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object(
        'hub', s.hub, 'day', s.day, 'participants', s.participants,
        'attempts', s.attempts))
      from (
        select hub, (created_at at time zone 'utc')::date as day,
               count(distinct participant_id) as participants,
               count(*) as attempts
        from attempts
        where phase = 1
        group by hub, (created_at at time zone 'utc')::date
      ) s
    ), '[]'::jsonb)
  );
$$;

revoke all on function dashboard_stats() from public;
grant execute on function dashboard_stats() to anon, authenticated;
