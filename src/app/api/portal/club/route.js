import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')

  const { data, error } = await supabaseAdmin
    .from('instituciones')
    .select('*')
    .eq('id', clubId)
    .single()

  if (error) return NextResponse.json(null, { status: 500 })
  return NextResponse.json(data)
}