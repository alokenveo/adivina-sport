import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

function calcContractStatus(contractEndDate) {
  const today = new Date()
  const end = new Date(contractEndDate)
  const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24))

  if (daysRemaining <= 0) return { status: 'expired',        color: '#EF4444', days: daysRemaining }
  if (daysRemaining <= 365) return { status: 'expiring_soon', color: '#EF4444', days: daysRemaining }
  return { status: 'active', color: '#22C55E', days: daysRemaining }
}

// GET /api/club/players/[clubId]
export async function GET(request, { params }) {
  const { clubId } = params

  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('club_id', clubId)
    .order('number')

  if (error) return NextResponse.json([], { status: 500 })

  const enriched = data.map(p => {
    const { status, color, days } = calcContractStatus(p.contract_end_date)
    return {
      ...p,
      contract_status: status,
      contract_color: color,
      days_remaining: days,
    }
  })

  return NextResponse.json(enriched)
}

// POST /api/club/players/[clubId]
export async function POST(request, { params }) {
  try {
    const { clubId } = params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('players')
      .insert([{ ...body, club_id: clubId }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ id: data.id, message: 'Player created' }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
