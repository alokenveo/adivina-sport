import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/equipment-designs/[clubId]
export async function GET(request, { params }) {
  const { clubId } = params

  const { data, error } = await supabaseAdmin
    .from('equipment_designs')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })

  // Añadir URL pública para cada diseño
  const enriched = data.map(d => ({
    ...d,
    file_url: d.file_url
      ? supabaseAdmin.storage.from('equipment-designs').getPublicUrl(d.file_url).data.publicUrl
      : null,
  }))

  return NextResponse.json(enriched)
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
