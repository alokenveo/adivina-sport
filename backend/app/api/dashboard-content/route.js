import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/dashboard-content
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('dashboard_content')
    .select('*')
    .eq('active', true)
    .order('order')

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/dashboard-content
export async function POST(request) {
  try {
    const body = await request.json()
    const { section_title, content, order } = body

    const { data, error } = await supabaseAdmin
      .from('dashboard_content')
      .insert([{ section_title, content, order: order || 0, active: true }])
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
