import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/admin/orders → todos los pedidos
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/orders → crear pedido
export async function POST(request) {
  try {
    const body = await request.json()
    const { club_id, description, items, notes } = body

    if (!club_id || !description) {
      return NextResponse.json({ error: 'club_id y description son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        club_id,
        description,
        items: items || [],
        notes: notes || '',
        status: 'received',
        status_history: [{
          status: 'received',
          label: 'Pedido Recibido',
          date: new Date().toISOString(),
          note: 'Pedido registrado en el sistema'
        }]
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
