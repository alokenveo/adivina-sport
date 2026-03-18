import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('instituciones')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}