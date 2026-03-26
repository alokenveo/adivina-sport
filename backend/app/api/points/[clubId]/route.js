import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/points/[clubId]
export async function GET(request, { params }) {
  const { clubId } = params

  const { data, error } = await supabaseAdmin
    .from('points')
    .select('*')
    .eq('club_id', clubId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Points record not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PUT /api/points/[clubId] → actualizar puntos (admin)
export async function PUT(request, { params }) {
  try {
    const { clubId } = params
    const { balance, note } = await request.json()

    // Obtener historial actual
    const { data: current } = await supabaseAdmin
      .from('points')
      .select('balance, history')
      .eq('club_id', clubId)
      .single()

    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      action: 'Admin Update',
      points: balance - (current?.balance || 0),
      description: note,
    }

    const newHistory = [...(current?.history || []), historyEntry]

    const { error } = await supabaseAdmin
      .from('points')
      .update({ balance, history: newHistory })
      .eq('club_id', clubId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Points updated successfully' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
