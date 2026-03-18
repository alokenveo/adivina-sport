import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data } = await supabaseAdmin.from('contratos').select('*').order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}

export async function POST(req) {
  const body = await req.json()
  const { data } = await supabaseAdmin.from('contratos').insert([{
    titulo: body.titulo, institucion_id: body.institucion_id,
    fecha_subida: body.fecha_subida, estado: body.estado, pdf_url: body.pdf_url
  }]).select().single()
  return NextResponse.json(data)
}

export async function PUT(req) {
  const body = await req.json()
  const update = { titulo: body.titulo, institucion_id: body.institucion_id, fecha_subida: body.fecha_subida, estado: body.estado }
  if (body.pdf_url) update.pdf_url = body.pdf_url
  const { data } = await supabaseAdmin.from('contratos').update(update).eq('id', body.id).select().single()
  return NextResponse.json(data)
}

export async function DELETE(req) {
  const { id } = await req.json()
  await supabaseAdmin.from('contratos').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}