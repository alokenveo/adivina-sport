import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')
  const institucionId = formData.get('institucionId')
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const filename = `${institucionId}.${ext}`

  // Elimina el logo anterior si existe
  await supabaseAdmin.storage.from('logos-clubes').remove([filename])

  const { error } = await supabaseAdmin.storage
    .from('logos-clubes')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from('logos-clubes').getPublicUrl(filename)
  return NextResponse.json({ url: data.publicUrl })
}