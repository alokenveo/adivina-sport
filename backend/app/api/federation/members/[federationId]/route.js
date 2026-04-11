import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/federation/members/[federationId] → clubs afiliados
export async function GET(request, { params }) {
  const { federationId } = params
  const { data, error } = await supabaseAdmin
    .from('federation_members')
    .select(`
      *,
      club:clubs!club_id(id, name, crest_url, sport, status)
    `)
    .eq('federation_id', federationId)
    .eq('active', true)
    .order('affiliated_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/federation/members/[federationId] → afiliar club
export async function POST(request, { params }) {
  try {
    const { federationId } = params
    const body = await request.json()
    const { club_id, sport, division } = body

    if (!club_id) {
      return NextResponse.json({ error: 'club_id requerido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('federation_members')
      .insert([{ federation_id: federationId, club_id, sport: sport || 'football', division: division || null }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/federation/members/[federationId]?club_id=xxx → desafiliar club
export async function DELETE(request, { params }) {
  try {
    const { federationId } = params
    const { searchParams } = new URL(request.url)
    const club_id = searchParams.get('club_id')

    if (!club_id) return NextResponse.json({ error: 'club_id requerido' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('federation_members')
      .delete()
      .eq('federation_id', federationId)
      .eq('club_id', club_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Club desafiliado' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
