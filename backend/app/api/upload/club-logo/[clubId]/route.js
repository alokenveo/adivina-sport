import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const BUCKET = 'logos-clubes'

// Formatos de imagen aceptados para escudos → extensión con la que se guardan
const ALLOWED_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
}

// Vercel limita el cuerpo de la petición a ~4.5 MB; nos quedamos por debajo
const MAX_SIZE = 4 * 1024 * 1024

// POST /api/upload/club-logo/[clubId]
export async function POST(request, { params }) {
  try {
    const { clubId } = params
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No se ha enviado ningún archivo' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Formato no válido. Usa PNG, JPG, WEBP, SVG o GIF' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'La imagen supera los 4 MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${clubId}-logo.${ext}`

    // Borra el escudo anterior en cualquier formato, para no dejar archivos huérfanos
    const oldFiles = [...new Set(Object.values(ALLOWED_TYPES))].map(e => `${clubId}-logo.${e}`)
    await supabaseAdmin.storage.from(BUCKET).remove(oldFiles)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('[club-logo] Error subiendo a Storage:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename)

    // El nombre del archivo es siempre el mismo, así que añadimos una versión
    // para que navegador y CDN no sigan mostrando el escudo anterior
    const crestUrl = `${data.publicUrl}?v=${Date.now()}`

    const { error: updateError } = await supabaseAdmin
      .from('clubs')
      .update({ crest_url: crestUrl })
      .eq('id', clubId)

    if (updateError) {
      console.error('[club-logo] Error guardando crest_url:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ file_url: crestUrl, message: 'Logo uploaded' })
  } catch (err) {
    console.error('[club-logo] Error inesperado:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}