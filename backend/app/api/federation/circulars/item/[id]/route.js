import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// DELETE /api/federation/circulars/item/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { error } = await supabaseAdmin.from('federation_circulars').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Circular eliminada' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
