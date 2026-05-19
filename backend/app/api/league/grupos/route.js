import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/grupos?season_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const season_id = searchParams.get('season_id')

  let query = supabaseAdmin
    .from('league_grupos')
    .select('*')
    .order('nombre', { ascending: true })

  if (season_id) query = query.eq('season_id', season_id)

  const { data, error } = await query
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/league/grupos → crear grupo
export async function POST(request) {
  try {
    const body = await request.json()
    const { season_id, nombre, region } = body

    if (!season_id || !nombre) {
      return NextResponse.json({ error: 'season_id y nombre son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('league_grupos')
      .insert([{ season_id, nombre, region: region || nombre }])
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