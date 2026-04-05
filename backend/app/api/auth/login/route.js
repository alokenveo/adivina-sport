import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// Secciones por defecto si el club no tiene nav_sections guardado aún (clubes legacy)
const FALLBACK_NAV_SECTIONS = [
  'contracts', 'invoices', 'points', 'kit-design', 'requests', 'orders', 'league'
]

export async function POST(request) {
  try {
    const { club_name, password } = await request.json()

    if (!club_name || !password) {
      return NextResponse.json({ error: 'club_name y password requeridos' }, { status: 400 })
    }

    const { data: club, error } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .eq('name', club_name)
      .eq('status', 'active')
      .single()

    if (error || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, club.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({
      token:        `club_${club.id}`,
      club_id:      club.id,
      club_name:    club.name,
      crest_url:    club.crest_url || null,
      sport:        club.sport || 'football',
      nav_sections: club.nav_sections || FALLBACK_NAV_SECTIONS,
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}