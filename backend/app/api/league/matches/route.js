import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/matches?season_id=xxx&round_id=xxx&team_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const season_id = searchParams.get('season_id')
  const round_id  = searchParams.get('round_id')
  const team_id   = searchParams.get('team_id')

  let query = supabaseAdmin
    .from('league_matches')
    .select(`
      *,
      home_team:league_teams!home_team_id(id, name, short_name, logo_url),
      away_team:league_teams!away_team_id(id, name, short_name, logo_url),
      round:league_rounds(id, number, name)
    `)
    .order('match_date', { ascending: true })

  if (season_id) query = query.eq('season_id', season_id)
  if (round_id)  query = query.eq('round_id', round_id)
  if (team_id)   query = query.or(`home_team_id.eq.${team_id},away_team_id.eq.${team_id}`)

  const { data, error } = await query

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/league/matches → crear partido
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      round_id, season_id,
      home_team_id, away_team_id,
      match_date, venue, notes
    } = body

    if (!round_id || !season_id || !home_team_id || !away_team_id) {
      return NextResponse.json(
        { error: 'round_id, season_id, home_team_id y away_team_id son requeridos' },
        { status: 400 }
      )
    }

    if (home_team_id === away_team_id) {
      return NextResponse.json({ error: 'Los equipos no pueden ser iguales' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('league_matches')
      .insert([{
        round_id,
        season_id,
        home_team_id,
        away_team_id,
        match_date: match_date || null,
        venue: venue || '',
        notes: notes || '',
        status: 'scheduled',
        home_score: null,
        away_score: null,
        home_scorers: [],
        away_scorers: [],
      }])
      .select(`
        *,
        home_team:league_teams!home_team_id(id, name, short_name, logo_url),
        away_team:league_teams!away_team_id(id, name, short_name, logo_url)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}