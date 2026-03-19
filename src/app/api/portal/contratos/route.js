import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')

  const { data, error } = await supabaseAdmin
    .from('contratos')
    .select('*')
    .eq('institucion_id', clubId)
    .order('fecha_subida', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}