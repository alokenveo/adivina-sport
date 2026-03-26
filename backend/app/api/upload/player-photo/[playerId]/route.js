import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// POST /api/upload/player-photo/[playerId]
export async function POST(request, { params }) {
  try {
    const { playerId } = params
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop()
    const filename = `${playerId}.${ext}`

    // Eliminar foto anterior si existe
    await supabaseAdmin.storage.from('players-photos').remove([filename])

    const { error } = await supabaseAdmin.storage
      .from('players-photos')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabaseAdmin.storage.from('players-photos').getPublicUrl(filename)

    // Actualizar foto en la tabla players
    await supabaseAdmin.from('players').update({ photo_url: data.publicUrl }).eq('id', playerId)

    return NextResponse.json({ photo_url: data.publicUrl, message: 'Photo uploaded' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
