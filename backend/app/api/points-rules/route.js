import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/points-rules
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('points_rules')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST /api/points-rules
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, event_type, points_per_unit, multiplier, description } = body

    if (!name || !event_type) {
      return NextResponse.json({ error: 'name y event_type son obligatorios' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('points_rules')
      .insert([{ name, event_type, points_per_unit, multiplier, description }])
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