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
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
