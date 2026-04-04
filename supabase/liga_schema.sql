-- ============================================================
-- LIGA ECUATOGUINEANA — SCHEMA SUPABASE
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Rol federación (para login similar al admin)
CREATE TABLE IF NOT EXISTS federation_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Temporadas
CREATE TABLE IF NOT EXISTS league_seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,           -- "Temporada 2025-2026"
  year_start INT NOT NULL,
  year_end INT NOT NULL,
  active BOOLEAN DEFAULT false, -- solo una activa a la vez
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipos de la liga (independientes de clubs de Adivina)
CREATE TABLE IF NOT EXISTS league_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,              -- "RAC", "SON", etc.
  logo_url TEXT,
  city TEXT,
  stadium TEXT,
  adivina_club_id TEXT REFERENCES clubs(id) ON DELETE SET NULL, -- null si no es miembro
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jornadas
CREATE TABLE IF NOT EXISTS league_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES league_seasons(id) ON DELETE CASCADE NOT NULL,
  number INT NOT NULL,          -- 1, 2, 3...
  name TEXT,                    -- "Jornada 1", "Cuartos", etc.
  date_start DATE,
  date_end DATE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partidos
CREATE TABLE IF NOT EXISTS league_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES league_rounds(id) ON DELETE CASCADE NOT NULL,
  season_id UUID REFERENCES league_seasons(id) ON DELETE CASCADE NOT NULL,
  home_team_id UUID REFERENCES league_teams(id) NOT NULL,
  away_team_id UUID REFERENCES league_teams(id) NOT NULL,
  match_date TIMESTAMPTZ,
  venue TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','finished','postponed')),
  home_score INT,
  away_score INT,
  home_scorers JSONB DEFAULT '[]', -- [{name, minute}]
  away_scorers JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clasificación (calculada, pero guardamos para no recalcular siempre)
CREATE TABLE IF NOT EXISTS league_standings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES league_seasons(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES league_teams(id) ON DELETE CASCADE NOT NULL,
  position INT DEFAULT 0,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  drawn INT DEFAULT 0,
  lost INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  goal_difference INT DEFAULT 0,
  points INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, team_id)
);

-- Noticias de liga
CREATE TABLE IF NOT EXISTS league_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES league_seasons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal','high')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: crear usuario federación por defecto
-- Cambiar la contraseña después desde el panel admin
-- password: "federacion2026" (bcrypt hash abajo)
-- ============================================================
-- INSERT INTO federation_users (username, password_hash, full_name)
-- VALUES ('federacion', '$2b$12$...hash...', 'Federación EG');
-- (Usar el endpoint /api/auth/federation/seed o hashearlo manualmente)
