import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/requests/[clubId]
export async function GET(request, { params }) {
  const { clubId } = params

  const { data, error } = await supabaseAdmin
    .from('requests')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/requests/[clubId]
export async function POST(request, { params }) {
  try {
    const { clubId } = params
    const body = await request.json()
    const { title, description } = body

    // Obtener nombre del club
    const { data: club } = await supabaseAdmin
      .from('clubs')
      .select('name')
      .eq('id', clubId)
      .single()

    if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

    const { data, error } = await supabaseAdmin
      .from('requests')
      .insert([{
        club_id: clubId,
        club_name: club.name,
        title,
        description,
        status: 'pending',
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
