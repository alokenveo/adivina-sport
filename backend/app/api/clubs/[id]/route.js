import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// PUT /api/clubs/[id] → actualizar club
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const update = {}
    if (body.name)       update.name = body.name
    if (body.crest_url)  update.crest_url = body.crest_url
    if (body.status)     update.status = body.status
    if (body.password)   update.password_hash = await bcrypt.hash(body.password, 12)

    const { data, error } = await supabaseAdmin
      .from('clubs')
      .update(update)
      .eq('id', id)
      .select('id, name, crest_url, status, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/clubs/[id] → eliminar club
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { error } = await supabaseAdmin.from('clubs').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Club deleted successfully' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
