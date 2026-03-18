import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')
  const institucionId = formData.get('institucionId')
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${institucionId}/${Date.now()}_${file.name}`

  const { error } = await supabaseAdmin.storage
    .from('contratos-pdf')
    .upload(filename, buffer, { contentType: 'application/pdf' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from('contratos-pdf').getPublicUrl(filename)
  return NextResponse.json({ url: data.publicUrl })
}