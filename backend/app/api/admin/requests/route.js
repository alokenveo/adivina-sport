import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/admin/requests → todas las solicitudes
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
