-- ============================================================
-- LIGA ECUATOGUINEANA — GRUPOS Y LIGUILLA
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Grupos regionales (Continental e Insular)
CREATE TABLE IF NOT EXISTS league_grupos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES league_seasons(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,           -- "Grupo Continental", "Grupo Insular"
  region TEXT,                    -- "continental", "insular"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Añadir grupo_id a league_teams (un equipo pertenece a un grupo en cada temporada)
-- Usamos tabla de membresía para no modificar league_teams
CREATE TABLE IF NOT EXISTS league_team_grupos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES league_seasons(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES league_teams(id) ON DELETE CASCADE NOT NULL,
  grupo_id UUID REFERENCES league_grupos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, team_id)
);

-- Añadir grupo_id y es_liguilla a league_rounds
ALTER TABLE league_rounds ADD COLUMN IF NOT EXISTS grupo_id UUID REFERENCES league_grupos(id) ON DELETE SET NULL;
ALTER TABLE league_rounds ADD COLUMN IF NOT EXISTS es_liguilla BOOLEAN DEFAULT false;

-- Añadir grupo_id a league_standings
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS grupo_id UUID REFERENCES league_grupos(id) ON DELETE SET NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_league_grupos_season ON league_grupos(season_id);
CREATE INDEX IF NOT EXISTS idx_league_team_grupos_season ON league_team_grupos(season_id);
CREATE INDEX IF NOT EXISTS idx_league_team_grupos_grupo ON league_team_grupos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_league_rounds_grupo ON league_rounds(grupo_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_grupo ON league_standings(grupo_id);
