import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/news
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('news')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/news
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, content, priority } = body

    if (!title) return NextResponse.json({ error: 'title requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('news')
      .insert([{ title, content, priority: priority || 'normal', active: true }])
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
