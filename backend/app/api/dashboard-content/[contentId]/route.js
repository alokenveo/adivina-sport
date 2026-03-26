import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// DELETE /api/dashboard-content/[contentId]
export async function DELETE(request, { params }) {
  try {
    const { contentId } = params
    const { error } = await supabaseAdmin.from('dashboard_content').delete().eq('id', contentId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Content deleted' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/dashboard-content/[contentId]
export async function PUT(request, { params }) {
  try {
    const { contentId } = params
    const body = await request.json()
    const { error } = await supabaseAdmin.from('dashboard_content').update(body).eq('id', contentId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Content updated' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
