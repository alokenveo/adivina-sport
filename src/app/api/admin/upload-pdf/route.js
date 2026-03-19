import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const institucionId = formData.get('institucionId')

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    if (!institucionId) return NextResponse.json({ error: 'No se recibió institucionId' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // elimina tildes y diacríticos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // reemplaza espacios y especiales por _
      .replace(/_+/g, '_')               // colapsa múltiples _ seguidos

    const filename = `${institucionId}/${Date.now()}_${safeName}`

    console.log('Subiendo PDF:', filename, 'Tamaño:', buffer.length)

    const { data, error } = await supabaseAdmin.storage
      .from('contratos-pdf')
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (error) {
      console.error('Error Supabase Storage:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    console.log('Subido correctamente:', data)
    return NextResponse.json({ url: filename })

  } catch (err) {
    console.error('Error inesperado upload-pdf:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}