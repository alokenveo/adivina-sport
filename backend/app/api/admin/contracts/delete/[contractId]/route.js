import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// DELETE /api/admin/contracts/delete/[contractId]
export async function DELETE(request, { params }) {
  try {
    const { contractId } = params
    const { error } = await supabaseAdmin.from('contracts').delete().eq('id', contractId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Contract deleted' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
