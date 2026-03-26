import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// POST /api/upload/design/[clubId]
export async function POST(request, { params }) {
  try {
    const { clubId } = params
    const formData = await request.formData()
    const file = formData.get('file')
    const design_name = formData.get('design_name') || 'Diseño'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop()
    const filename = `${clubId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('equipment-designs')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: urlData } = supabaseAdmin.storage.from('equipment-designs').getPublicUrl(filename)

    // Guardar en tabla equipment_designs
    const { data, error } = await supabaseAdmin
      .from('equipment_designs')
      .insert([{ club_id: clubId, design_name, file_url: filename, status: 'approved' }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ file_url: urlData.publicUrl, message: 'Design uploaded' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
