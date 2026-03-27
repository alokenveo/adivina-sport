import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/contracts/[clubId] → contratos de un club (vista miembro)
export async function GET(request, { params }) {
  const { clubId } = params

  const { data, error } = await supabaseAdmin
    .from('contracts')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })

  // Generar URL firmada (válida 1 hora) para cada contrato con PDF
  const enriched = await Promise.all(
    data.map(async (contract) => {
      if (!contract.file_url) return contract

      const { data: signedData, error: signedError } = await supabaseAdmin
        .storage
        .from('contratos-pdf')
        .createSignedUrl(contract.file_url, 3600) // 1 hora de validez

      return {
        ...contract,
        file_url: signedError ? null : signedData.signedUrl,
      }
    })
  )

  return NextResponse.json(enriched)
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
