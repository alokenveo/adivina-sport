import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/admin/invoices → todas las facturas
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/invoices → crear factura
export async function POST(request) {
  try {
    const body = await request.json()
    const { club_id, title, amount, due_date, grace_period_days, interest_rate } = body

    if (!club_id || !title || !amount || !due_date) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert([{
        club_id,
        title,
        amount,
        due_date,
        grace_period_days: grace_period_days || 15,
        interest_rate: interest_rate || 5.0,
        paid: false,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ id: data.id, message: 'Invoice created' }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
