import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')

  const { data, error } = await supabaseAdmin
    .from('anuncios')
    .select('*')
    .or(`institucion_id.eq.${clubId},institucion_id.is.null`)
    .order('fecha_creacion', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}