import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/teams → todos los equipos activos
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('league_teams')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/league/teams → crear equipo
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, short_name, city, stadium, adivina_club_id } = body

    if (!name) {
      return NextResponse.json({ error: 'name es requerido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('league_teams')
      .insert([{
        name,
        short_name: short_name || name.substring(0, 3).toUpperCase(),
        city: city || '',
        stadium: stadium || '',
        adivina_club_id: adivina_club_id || null,
        active: true,
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