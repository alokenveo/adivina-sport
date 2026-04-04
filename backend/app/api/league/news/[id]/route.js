import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT /api/league/news/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { error } = await supabaseAdmin.from('league_news').update(body).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Noticia actualizada' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/league/news/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { error } = await supabaseAdmin.from('league_news').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Noticia eliminada' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}