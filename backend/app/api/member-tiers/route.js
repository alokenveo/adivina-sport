import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/member-tiers
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('member_tiers')
    .select('*')
    .order('min_points')

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/member-tiers → guardar configuración completa
export async function POST(request) {
  try {
    const body = await request.json()
    const { tiers } = body

    if (!tiers || !Array.isArray(tiers)) {
      return NextResponse.json({ error: 'tiers array requerido' }, { status: 400 })
    }

    // Upsert cada tier
    for (const tier of tiers) {
      await supabaseAdmin
        .from('member_tiers')
        .upsert([tier], { onConflict: 'id' })
    }

    return NextResponse.json({ message: 'Tiers saved' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
