import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// POST /api/upload/league-team-logo/[teamId]
export async function POST(request, { params }) {
  try {
    const { teamId } = params
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop()
    const filename = `league-teams/${teamId}.${ext}`

    await supabaseAdmin.storage.from('logos-clubes').remove([filename])

    const { error } = await supabaseAdmin.storage
      .from('logos-clubes')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabaseAdmin.storage.from('logos-clubes').getPublicUrl(filename)

    await supabaseAdmin.from('league_teams').update({ logo_url: data.publicUrl }).eq('id', teamId)

    return NextResponse.json({ logo_url: data.publicUrl, message: 'Logo subido' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}