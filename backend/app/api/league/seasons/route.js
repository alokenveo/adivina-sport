import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/seasons → todas las temporadas
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('league_seasons')
    .select('*')
    .order('year_start', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/league/seasons → crear temporada
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, year_start, year_end, active } = body

    if (!name || !year_start || !year_end) {
      return NextResponse.json({ error: 'name, year_start y year_end son requeridos' }, { status: 400 })
    }

    // Si se marca como activa, desactivar las demás
    if (active) {
      await supabaseAdmin
        .from('league_seasons')
        .update({ active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { data, error } = await supabaseAdmin
      .from('league_seasons')
      .insert([{ name, year_start, year_end, active: active || false }])
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