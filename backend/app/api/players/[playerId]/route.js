import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT /api/players/[playerId]
export async function PUT(request, { params }) {
  try {
    const { playerId } = params
    const body = await request.json()

    const { error } = await supabaseAdmin
      .from('players')
      .update(body)
      .eq('id', playerId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Player updated' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/players/[playerId]
export async function DELETE(request, { params }) {
  try {
    const { playerId } = params
    const { error } = await supabaseAdmin.from('players').delete().eq('id', playerId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Player deleted' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
