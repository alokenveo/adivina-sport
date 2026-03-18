import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data } = await supabaseAdmin.from('instituciones').select('*').order('nombre')
  return NextResponse.json(data || [])
}

export async function POST(req) {
  const body = await req.json()
  const { data } = await supabaseAdmin.from('instituciones').insert([{
    nombre: body.nombre, contrasena: body.contrasena,
    descripcion: body.descripcion, activo: body.activo
  }]).select().single()
  return NextResponse.json(data)
}

export async function PUT(req) {
  const body = await req.json()
  const update = { nombre: body.nombre, descripcion: body.descripcion, activo: body.activo }
  if (body.contrasena) update.contrasena = body.contrasena
  const { data } = await supabaseAdmin.from('instituciones').update(update).eq('id', body.id).select().single()
  return NextResponse.json(data)
}

export async function DELETE(req) {
  const { id } = await req.json()
  await supabaseAdmin.from('instituciones').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}