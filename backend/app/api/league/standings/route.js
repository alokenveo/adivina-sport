import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/standings?season_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const season_id = searchParams.get('season_id')

  if (!season_id) {
    return NextResponse.json({ error: 'season_id es requerido' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('league_standings')
    .select(`
      *,
      team:league_teams(id, name, short_name, logo_url, adivina_club_id)
    `)
    .eq('season_id', season_id)
    .order('position', { ascending: true })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}