import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Evita que Next.js cachee la respuesta: la consulta tiene que llegar a Supabase siempre
export const dynamic = 'force-dynamic'

// GET /api/cron/keep-alive → lo llama Vercel Cron cada pocos días
// para que el proyecto de Supabase no se pause por inactividad
export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Consulta mínima: una fila, un campo
  const { error } = await supabaseAdmin
    .from('league_seasons')
    .select('id')
    .limit(1)

  if (error) {
    console.error('[keep-alive] Error consultando Supabase:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  console.log('[keep-alive] Supabase OK')
  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}