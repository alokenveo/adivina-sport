import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { institucionId, contrasena } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('instituciones')
    .select('*')
    .eq('id', institucionId)
    .eq('contrasena', contrasena)
    .eq('activo', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  return NextResponse.json({ club: { id: data.id, nombre: data.nombre } })
}