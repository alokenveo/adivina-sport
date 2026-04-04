import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/league/news?season_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const season_id = searchParams.get('season_id')

  let query = supabaseAdmin
    .from('league_news')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (season_id) query = query.eq('season_id', season_id)

  const { data, error } = await query

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// POST /api/league/news → crear noticia de liga
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, content, season_id, image_url, priority } = body

    if (!title) {
      return NextResponse.json({ error: 'title es requerido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('league_news')
      .insert([{
        title,
        content: content || '',
        season_id: season_id || null,
        image_url: image_url || null,
        priority: priority || 'normal',
        active: true,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}