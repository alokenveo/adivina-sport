import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/admin/invoices/[id] → facturas de un club (vista admin)
export async function GET(request, { params }) {
  const { id } = params  // ← antes era clubId

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('club_id', id)  // ← antes era clubId
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}