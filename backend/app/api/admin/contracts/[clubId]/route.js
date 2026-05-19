import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { applyAutoPoints } from '@/lib/pointsHelper'

// POST /api/admin/contracts/[clubId] → crear contrato con PDF + puntos automáticos
export async function POST(request, { params }) {
  try {
    const { clubId } = params
    const formData = await request.formData()

    const title       = formData.get('title')
    const description = formData.get('description') || ''
    const start_date  = formData.get('start_date')
    const end_date    = formData.get('end_date')
    const value       = parseFloat(formData.get('value') || '0')
    const file        = formData.get('file')

    if (!title || !start_date || !end_date) {
      return NextResponse.json({ error: 'title, start_date y end_date son requeridos' }, { status: 400 })
    }

    let file_url = null

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const safeName = file.name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
      const filename = `${clubId}/${Date.now()}_${safeName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('contratos-pdf')
        .upload(filename, buffer, { contentType: 'application/pdf', upsert: false })

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }
      file_url = filename
    }

    const { data, error } = await supabaseAdmin
      .from('contracts')
      .insert([{
        club_id: clubId,
        title,
        description,
        start_date,
        end_date,
        value,
        file_url,
        status: 'active',
        date: start_date,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // ── Puntos automáticos por contrato firmado ─────────────────────────
    // Solo si el contrato tiene valor económico
    if (value > 0) {
      await applyAutoPoints(
        clubId,
        'contract_signed',
        value,
        `Contrato firmado: ${title}`
      )
    }
    // ────────────────────────────────────────────────────────────────────

    return NextResponse.json({ id: data.id, file_url, message: 'Contract created' }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}