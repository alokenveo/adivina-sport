import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const STATUS_LABELS = {
  received:    'Pedido Recibido',
  preparing:   'En Preparación',
  production:  'En Producción',
  quality:     'Control de Calidad',
  ready:       'Listo para Envío',
  shipped:     'Enviado',
  delivered:   'Entregado',
}

// PUT /api/admin/orders/[orderId] → actualizar estado
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

    // Actualizar campos básicos si se proveen
    if (description !== undefined) updateData.description = description
    if (items !== undefined) updateData.items = items
    if (notes !== undefined) updateData.notes = notes

    // Actualizar estado si se provee
    if (status && STATUS_LABELS[status]) {
      updateData.status = status
      const historyEntry = {
        status,
        label: STATUS_LABELS[status],
        date: new Date().toISOString(),
        note: note || STATUS_LABELS[status]
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
