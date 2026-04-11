import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/federation/circulars/[federationId]
export async function GET(request, { params }) {
  const { federationId } = params
  const { data, error } = await supabaseAdmin
    .from('federation_circulars')
    .select('*')
    .eq('federation_id', federationId)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/federation/circulars/[federationId]
export async function POST(request, { params }) {
  try {
    const { federationId } = params
    const body = await request.json()
    const { title, content, priority, target_clubs } = body

    if (!title) return NextResponse.json({ error: 'title requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('federation_circulars')
      .insert([{
        federation_id: federationId,
        title,
        content: content || '',
        priority: priority || 'normal',
        target_clubs: target_clubs || [],
        active: true,
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
