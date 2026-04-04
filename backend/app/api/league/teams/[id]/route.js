import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT /api/league/teams/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('league_teams')
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

// DELETE /api/league/teams/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    // Soft delete
    const { error } = await supabaseAdmin
      .from('league_teams')
      .update({ active: false })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Equipo eliminado' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}