import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT /api/league/seasons/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    // Si se activa esta temporada, desactivar las demás
    if (body.active) {
      await supabaseAdmin
        .from('league_seasons')
        .update({ active: false })
        .neq('id', id)
    }

    const { data, error } = await supabaseAdmin
      .from('league_seasons')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/league/seasons/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { error } = await supabaseAdmin.from('league_seasons').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Temporada eliminada' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}