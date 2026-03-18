import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data } = await supabaseAdmin.from('anuncios').select('*').order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}

export async function POST(req) {
  const body = await req.json()
  const { data } = await supabaseAdmin.from('anuncios').insert([{
    titulo: body.titulo, contenido: body.contenido,
    fecha_creacion: body.fecha_creacion, institucion_id: body.institucion_id
  }]).select().single()
  return NextResponse.json(data)
}

export async function PUT(req) {
  const body = await req.json()
  const { data } = await supabaseAdmin.from('anuncios').update({
    titulo: body.titulo, contenido: body.contenido,
    fecha_creacion: body.fecha_creacion, institucion_id: body.institucion_id
  }).eq('id', body.id).select().single()
  return NextResponse.json(data)
}

export async function DELETE(req) {
  const { id } = await req.json()
  await supabaseAdmin.from('anuncios').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}