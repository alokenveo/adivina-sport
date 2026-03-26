import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// DELETE /api/points-rules/[id]
export async function DELETE(request, { params }) {
  const { id } = params

  const { error } = await supabaseAdmin
    .from('points_rules')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: 'Regla eliminada' })
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}