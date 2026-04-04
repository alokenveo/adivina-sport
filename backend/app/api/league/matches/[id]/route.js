import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT /api/league/matches/[id] → actualizar partido (resultado, estado, etc.)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('league_matches')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        home_team:league_teams!home_team_id(id, name, short_name, logo_url),
        away_team:league_teams!away_team_id(id, name, short_name, logo_url),
        round:league_rounds(id, number, name)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Si el partido está terminado, recalcular clasificación
    if (body.status === 'finished' && body.home_score !== undefined && body.away_score !== undefined) {
      await recalculateStandings(data.season_id)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/league/matches/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Obtener season_id antes de borrar para recalcular
    const { data: match } = await supabaseAdmin
      .from('league_matches')
      .select('season_id')
      .eq('id', id)
      .single()

    const { error } = await supabaseAdmin.from('league_matches').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    if (match?.season_id) {
      await recalculateStandings(match.season_id)
    }

    return NextResponse.json({ message: 'Partido eliminado' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Recalcular clasificación completa de una temporada ──────────────────────
async function recalculateStandings(seasonId) {
  try {
    // Obtener todos los partidos terminados de la temporada
    const { data: matches } = await supabaseAdmin
      .from('league_matches')
      .select('home_team_id, away_team_id, home_score, away_score')
      .eq('season_id', seasonId)
      .eq('status', 'finished')
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)

    if (!matches || matches.length === 0) return

    // Acumular stats por equipo
    const stats = {}

    const initTeam = (id) => {
      if (!stats[id]) {
        stats[id] = {
          team_id: id, season_id: seasonId,
          played: 0, won: 0, drawn: 0, lost: 0,
          goals_for: 0, goals_against: 0,
          goal_difference: 0, points: 0,
        }
      }
    }

    for (const m of matches) {
      const { home_team_id, away_team_id, home_score, away_score } = m
      initTeam(home_team_id)
      initTeam(away_team_id)

      const h = stats[home_team_id]
      const a = stats[away_team_id]

      h.played++; a.played++
      h.goals_for      += home_score; h.goals_against += away_score
      a.goals_for      += away_score; a.goals_against += home_score

      if (home_score > away_score) {
        h.won++; h.points += 3
        a.lost++
      } else if (home_score < away_score) {
        a.won++; a.points += 3
        h.lost++
      } else {
        h.drawn++; h.points += 1
        a.drawn++; a.points += 1
      }
    }

    // Calcular diferencia de goles y posición
    const rows = Object.values(stats).map(s => ({
      ...s,
      goal_difference: s.goals_for - s.goals_against,
    }))

    rows.sort((a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for
    )

    rows.forEach((r, i) => { r.position = i + 1 })

    // Upsert clasificación
    for (const row of rows) {
      await supabaseAdmin
        .from('league_standings')
        .upsert([{ ...row, updated_at: new Date().toISOString() }], {
          onConflict: 'season_id,team_id',
        })
    }
  } catch (err) {
    console.error('Error recalculating standings:', err)
  }
}

export { recalculateStandings }

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}