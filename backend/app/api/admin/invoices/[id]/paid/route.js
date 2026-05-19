import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { applyAutoPoints } from '@/lib/pointsHelper'

// PUT /api/admin/invoices/[id]/paid → marcar como pagada + puntos automáticos
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const today = new Date().toISOString().split('T')[0]

    // Obtener la factura antes de marcarla como pagada
    const { data: invoice, error: fetchError } = await supabaseAdmin
      .from('invoices')
      .select('club_id, amount, due_date, title, paid')
      .eq('id', id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    // Evitar doble aplicación si ya estaba pagada
    if (invoice.paid) {
      return NextResponse.json({ message: 'Invoice already paid' })
    }

    const { error } = await supabaseAdmin
      .from('invoices')
      .update({ paid: true, paid_date: today })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // ── Puntos automáticos ──────────────────────────────────────────────
    // Determinar si el pago es anticipado (antes del vencimiento)
    const isPaidEarly = today <= invoice.due_date

    if (isPaidEarly) {
      // Aplicar regla early_payment primero (puede tener multiplicador bonus)
      const earlyPoints = await applyAutoPoints(
        invoice.club_id,
        'early_payment',
        invoice.amount,
        `Pago anticipado: ${invoice.title}`
      )
      // Si no hay regla early_payment configurada, aplicar purchase normal
      if (!earlyPoints) {
        await applyAutoPoints(
          invoice.club_id,
          'purchase',
          invoice.amount,
          `Pago de factura: ${invoice.title}`
        )
      }
    } else {
      // Pago normal o tardío → regla purchase
      await applyAutoPoints(
        invoice.club_id,
        'purchase',
        invoice.amount,
        `Pago de factura: ${invoice.title}`
      )
    }
    // ───────────────────────────────────────────────────────────────────

    return NextResponse.json({ message: 'Invoice marked as paid' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/invoices/[id]/paid → eliminar factura
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { error } = await supabaseAdmin.from('invoices').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Invoice deleted' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}