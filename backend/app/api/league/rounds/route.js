import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/rounds?season_id=xxx → jornadas de una temporada
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const season_id = searchParams.get('season_id')

  let query = supabaseAdmin
    .from('league_rounds')
    .select('*')
    .order('number', { ascending: true })

  if (season_id) query = query.eq('season_id', season_id)

  const { data, error } = await query

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/league/rounds → crear jornada
export async function POST(request) {
  try {
    const body = await request.json()
    const { season_id, number, name, date_start, date_end } = body

    if (!season_id || !number) {
      return NextResponse.json({ error: 'season_id y number son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('league_rounds')
      .insert([{
        season_id,
        number,
        name: name || `Jornada ${number}`,
        date_start: date_start || null,
        date_end: date_end || null,
        status: 'upcoming',
      }])
      .select()
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