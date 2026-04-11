import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// Secciones disponibles en el nav del portal de clubes
export const ALL_NAV_SECTIONS = [
  'contracts',
  'invoices',
  'points',
  'kit-design',
  'requests',
  'orders',
  'league',
]

// Secciones por defecto según el deporte al crear el club
const DEFAULT_NAV_SECTIONS_BY_SPORT = {
  football:   ['contracts', 'invoices', 'points', 'kit-design', 'requests', 'orders', 'league'],
  basketball: ['contracts', 'invoices', 'points', 'kit-design', 'requests', 'orders', 'league'],
  volleyball: ['contracts', 'invoices', 'points', 'kit-design', 'requests', 'orders'],
  futsal:     ['contracts', 'invoices', 'points', 'kit-design', 'requests', 'orders', 'league'],
  other:      ['contracts', 'invoices', 'points', 'requests', 'orders'],
}

// GET /api/clubs → lista todos los clubs
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('clubs')
    .select('id, name, crest_url, status, sport, nav_sections, created_at')
    .order('name')

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/clubs → crear club
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, password, crest_url, sport } = body

    if (!name || !password) {
      return NextResponse.json({ error: 'name y password requeridos' }, { status: 400 })
    }

    // Generar id slug desde el nombre
    const id = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const hash = await bcrypt.hash(password, 12)
    const selectedSport = sport || 'football'
    const navSections = DEFAULT_NAV_SECTIONS_BY_SPORT[selectedSport] || DEFAULT_NAV_SECTIONS_BY_SPORT.other

    const { data, error } = await supabaseAdmin
      .from('clubs')
      .insert([{
        id,
        name,
        password_hash: hash,
        crest_url: crest_url || null,
        status: 'active',
        sport: selectedSport,
        nav_sections: navSections,
      }])
      .select('id, name, crest_url, status, sport, nav_sections, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Crear perfil y puntos vacíos automáticamente
    await supabaseAdmin.from('club_profiles').insert([{ club_id: id }])
    await supabaseAdmin.from('points').insert([{ club_id: id, balance: 0, history: [] }])

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
