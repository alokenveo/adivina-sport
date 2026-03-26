import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// DELETE /api/news/[newsId]
export async function DELETE(request, { params }) {
  try {
    const { newsId } = params
    const { error } = await supabaseAdmin.from('news').delete().eq('id', newsId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'News deleted' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/news/[newsId]
export async function PUT(request, { params }) {
  try {
    const { newsId } = params
    const body = await request.json()
    const { error } = await supabaseAdmin.from('news').update(body).eq('id', newsId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'News updated' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
