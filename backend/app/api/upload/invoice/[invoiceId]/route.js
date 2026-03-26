import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// POST /api/upload/invoice/[invoiceId]
export async function POST(request, { params }) {
  try {
    const { invoiceId } = params
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = file.name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `invoices/${invoiceId}_${safeName}`

    const { error } = await supabaseAdmin.storage
      .from('contratos-pdf')
      .upload(filename, buffer, { contentType: 'application/pdf', upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Actualizar file_url en invoices
    await supabaseAdmin.from('invoices').update({ file_url: filename }).eq('id', invoiceId)

    return NextResponse.json({ file_url: filename, message: 'Invoice PDF uploaded' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
