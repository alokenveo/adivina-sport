-- ============================================================
-- ADIVINA SPORTS - Schema Supabase
-- Equivalente al MongoDB de Emergent (FastAPI)
-- ============================================================

-- ============================================================
-- ADMINS
-- ============================================================
create table public.admins (
  id uuid not null default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamp with time zone null default now(),
  constraint admins_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- CLUBS (equivale a instituciones, ampliada)
-- ============================================================
create table public.clubs (
  id text not null,           -- slug: "nueva-era", "adamm", etc.
  name text not null unique,
  password_hash text not null,
  crest_url text null,
  status text null default 'active',  -- active | inactive
  description text null,
  primary_color text null default '#DFFF00',
  secondary_color text null default '#000000',
  contact_email text null,
  contact_phone text null,
  created_at timestamp with time zone null default now(),
  constraint clubs_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- CLUB PROFILES (directiva, colores, equipos, ciudad)
-- ============================================================
create table public.club_profiles (
  id uuid not null default gen_random_uuid(),
  club_id text not null references public.clubs(id) on delete cascade,
  num_players integer null default 0,
  teams jsonb null default '[]'::jsonb,
  official_colors jsonb null default '[]'::jsonb,
  city text null default '',
  stadium text null default '',
  directiva jsonb null default '{
    "owner": null,
    "founder": null,
    "historical_partner": null,
    "president": null,
    "vice_president": null,
    "secretary": null,
    "technical_director": null,
    "assistant_coaches": []
  }'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint club_profiles_pkey primary key (id),
  constraint club_profiles_club_id_key unique (club_id)
) tablespace pg_default;

-- ============================================================
-- PLAYERS (jugadores)
-- ============================================================
create table public.players (
  id uuid not null default gen_random_uuid(),
  club_id text not null references public.clubs(id) on delete cascade,
  name text not null,
  number integer not null,
  age integer not null,
  position text not null,       -- Portero | Defensa | Centrocampista | Delantero
  jersey_size text not null,    -- XS | S | M | L | XL | XXL
  nationality text not null,
  contract_end_date date not null,
  photo_url text null,
  created_at timestamp with time zone null default now(),
  constraint players_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- CONTRACTS (contratos, ampliada respecto a la original)
-- ============================================================
create table public.contracts (
  id uuid not null default gen_random_uuid(),
  club_id text not null references public.clubs(id) on delete cascade,
  title text not null,
  description text null,
  start_date date null,
  end_date date null,
  value numeric null default 0,
  file_url text null,
  status text null default 'active',  -- active | completed | pending
  date date null default current_date,
  created_at timestamp with time zone null default now(),
  constraint contracts_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- INVOICES (facturas con interés por mora)
-- ============================================================
create table public.invoices (
  id uuid not null default gen_random_uuid(),
  club_id text not null references public.clubs(id) on delete cascade,
  title text not null,
  amount numeric not null,
  currency text null default 'XAF',
  due_date date not null,
  grace_period_days integer null default 15,
  interest_rate numeric null default 5.0,   -- % mensual
  paid boolean null default false,
  paid_date date null,
  file_url text null,
  created_at timestamp with time zone null default now(),
  constraint invoices_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- POINTS (puntos y historial por club)
-- ============================================================
create table public.points (
  id uuid not null default gen_random_uuid(),
  club_id text not null references public.clubs(id) on delete cascade,
  balance integer null default 0,
  history jsonb null default '[]'::jsonb,
  constraint points_pkey primary key (id),
  constraint points_club_id_key unique (club_id)
) tablespace pg_default;

-- ============================================================
-- POINTS RULES - Tabla para el motor de reglas de puntos
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

create table public.points_rules (
  id uuid not null default gen_random_uuid(),
  name text not null,
  event_type text not null,          -- purchase | early_payment | contract_signed | milestone
  points_per_unit integer not null default 1,
  multiplier numeric not null default 1,
  description text null,
  created_at timestamp with time zone null default now(),
  constraint points_rules_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- NEWS (noticias / anuncios globales)
-- ============================================================
create table public.news (
  id uuid not null default gen_random_uuid(),
  title text not null,
  content text null,
  priority text null default 'normal',  -- normal | high
  active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint news_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- EQUIPMENT DESIGNS (diseños de kit)
-- ============================================================
create table public.equipment_designs (
  id uuid not null default gen_random_uuid(),
  club_id text not null references public.clubs(id) on delete cascade,
  design_name text not null,
  file_url text null,
  status text null default 'approved',
  created_at timestamp with time zone null default now(),
  constraint equipment_designs_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- REQUESTS (solicitudes de clubes al admin)
-- ============================================================
create table public.requests (
  id uuid not null default gen_random_uuid(),
  club_id text not null references public.clubs(id) on delete cascade,
  club_name text not null,
  title text not null,
  description text null,
  status text null default 'pending',   -- pending | approved | rejected
  admin_response text null,
  created_at timestamp with time zone null default now(),
  constraint requests_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- DASHBOARD CONTENT (contenido editable del dashboard)
-- ============================================================
create table public.dashboard_content (
  id uuid not null default gen_random_uuid(),
  section_title text not null,
  content text null,
  "order" integer null default 0,
  active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint dashboard_content_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- MEMBER TIERS (niveles de membresía)
-- ============================================================
create table public.member_tiers (
  id text not null,             -- silver | gold | premium | elite
  name text not null,
  min_points integer null default 0,
  color text null default '#C0C0C0',
  benefits text null,
  constraint member_tiers_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- SETTINGS (configuraciones generales - key/value)
-- ============================================================
create table public.settings (
  id uuid not null default gen_random_uuid(),
  type text not null unique,
  data jsonb null default '{}'::jsonb,
  updated_at timestamp with time zone null default now(),
  constraint settings_pkey primary key (id)
) tablespace pg_default;

-- ============================================================
-- STORAGE BUCKETS (ejecutar en Supabase Dashboard > Storage)
-- Crear estos buckets manualmente:
--   - contratos-pdf  (privado)
--   - logos-clubes   (público)
--   - players-photos (público)
--   - equipment-designs (público)
-- ============================================================

-- ============================================================
-- SEED DATA - Datos iniciales
-- ============================================================

-- Tiers por defecto
insert into public.member_tiers (id, name, min_points, color, benefits) values
  ('silver',  'Silver',  0,    '#C0C0C0', null),
  ('gold',    'Gold',    1000, '#FFD700', null),
  ('premium', 'Premium', 2500, '#E5E4E2', null),
  ('elite',   'Elite',   5000, '#DFFF00', null);

-- Clubes de prueba
-- IMPORTANTE: las contraseñas aquí son bcrypt hashes
-- nuevaera123  → $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQIp9PiC
-- adamm123     → $2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uFwtHJ.A2
-- feguibasket123 → $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
-- movistar123  → $2b$12$WN.T9WQDP5KI2T9f6mE.5OGfPANq1c4Rz0o4f8RgI.VUwXOaXq4y

-- NOTA: Los hashes reales se generan al crear los clubes via API
-- Estos son placeholders - usa la API /api/auth/seed para inicializar

-- Puntos iniciales se crean automáticamente al crear cada club