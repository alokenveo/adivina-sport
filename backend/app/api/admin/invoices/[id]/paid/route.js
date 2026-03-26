import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT /api/admin/invoices/[id]/paid → marcar como pagada
export async function PUT(request, { params }) {
  try {
    const { id } = params  // ← antes era invoiceId
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabaseAdmin
      .from('invoices')
      .update({ paid: true, paid_date: today })
      .eq('id', id)  // ← antes era invoiceId

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Invoice marked as paid' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/invoices/[id]/paid → eliminar factura
export async function DELETE(request, { params }) {
  try {
    const { id } = params  // ← antes era invoiceId
    const { error } = await supabaseAdmin.from('invoices').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Invoice deleted' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
