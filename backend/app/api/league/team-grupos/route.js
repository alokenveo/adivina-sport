import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/team-grupos?season_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const season_id = searchParams.get('season_id')

  let query = supabaseAdmin
    .from('league_team_grupos')
    .select('*')

  if (season_id) query = query.eq('season_id', season_id)

  const { data, error } = await query
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/league/team-grupos → asignar equipo a grupo (upsert)
export async function POST(request) {
  try {
    const body = await request.json()
    const { season_id, team_id, grupo_id } = body

    if (!season_id || !team_id) {
      return NextResponse.json({ error: 'season_id y team_id son requeridos' }, { status: 400 })
    }

    if (grupo_id) {
      // Upsert: asignar grupo
      const { data, error } = await supabaseAdmin
        .from('league_team_grupos')
        .upsert([{ season_id, team_id, grupo_id }], { onConflict: 'season_id,team_id' })
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(data, { status: 201 })
    } else {
      // Eliminar asignación (sin grupo)
      await supabaseAdmin
        .from('league_team_grupos')
        .delete()
        .eq('season_id', season_id)
        .eq('team_id', team_id)
      return NextResponse.json({ message: 'Asignación eliminada' })
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}