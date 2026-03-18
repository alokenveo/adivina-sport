import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) return NextResponse.json({ error: 'Path requerido' }, { status: 400 })

  const { data, error } = await supabaseAdmin.storage
    .from('contratos-pdf')
    .createSignedUrl(path, 60 * 60) // URL válida 1 hora

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}