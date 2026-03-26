import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const DEFAULT_DIRECTIVA = {
  owner: null,
  founder: null,
  historical_partner: null,
  president: null,
  vice_president: null,
  secretary: null,
  technical_director: null,
  assistant_coaches: [],
}

// GET /api/club/profile/[clubId]
export async function GET(request, { params }) {
  const { clubId } = params

  const { data, error } = await supabaseAdmin
    .from('club_profiles')
    .select('*')
    .eq('club_id', clubId)
    .single()

  if (error || !data) {
    // Devolver perfil vacío si no existe
    return NextResponse.json({
      club_id: clubId,
      num_players: 0,
      teams: [],
      official_colors: [],
      city: '',
      stadium: '',
      directiva: DEFAULT_DIRECTIVA,
    })
  }

  return NextResponse.json({
    ...data,
    directiva: data.directiva || DEFAULT_DIRECTIVA,
  })
}

// PUT /api/club/profile/[clubId]
export async function PUT(request, { params }) {
  try {
    const { clubId } = params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('club_profiles')
      .upsert([{ ...body, club_id: clubId, updated_at: new Date().toISOString() }], { onConflict: 'club_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Profile updated', data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
