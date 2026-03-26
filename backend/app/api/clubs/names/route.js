import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/clubs/names → solo nombres de clubs activos (para el dropdown de login)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('clubs')
    .select('name')
    .eq('status', 'active')
    .order('name')

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data.map(c => c.name))
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
