import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { applyAutoPoints } from '@/lib/pointsHelper'

const STATUS_LABELS = {
  received:   'Pedido Recibido',
  preparing:  'En Preparación',
  production: 'En Producción',
  quality:    'Control de Calidad',
  ready:      'Listo para Envío',
  shipped:    'Enviado',
  delivered:  'Entregado',
}

// PUT /api/admin/orders/[orderId] → actualizar estado + puntos si se entrega
export async function PUT(request, { params }) {
  try {
    const { orderId } = params
    const body = await request.json()
    const { status, note, description, items, notes } = body

    // Obtener pedido actual
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const updateData = {}

    if (description !== undefined) updateData.description = description
    if (items !== undefined)       updateData.items = items
    if (notes !== undefined)       updateData.notes = notes

    if (status && STATUS_LABELS[status]) {
      updateData.status = status
      const historyEntry = {
        status,
        label: STATUS_LABELS[status],
        date: new Date().toISOString(),
        note: note || STATUS_LABELS[status],
      }
      updateData.status_history = [...(current.status_history || []), historyEntry]
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // ── Puntos automáticos al entregar el pedido ────────────────────────
    // Solo se aplican si el estado cambia a 'delivered' y antes no lo era
    if (status === 'delivered' && current.status !== 'delivered') {
      // El pedido no tiene valor económico propio, usamos la regla 'milestone'
      // con valor 1 para que el admin configure los puntos fijos en points_rules
      // (points_per_unit = puntos a dar, multiplier = 1)
      await applyAutoPoints(
        current.club_id,
        'milestone',
        1,
        `Pedido entregado: ${current.description}`
      )
    }
    // ────────────────────────────────────────────────────────────────────

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/orders/[orderId]
export async function DELETE(request, { params }) {
  try {
    const { orderId } = params
    const { error } = await supabaseAdmin.from('orders').delete().eq('id', orderId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Pedido eliminado' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}